#This script export powerpoint files (in the current directory and below).
#All slides are converted to png files and stored on IPFS
#A list of the slides (including number, title, IPFS hash) are stored in a .json file
#The json file is also stored on IPFS

$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
[Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Powerpoint") > $null
[Reflection.Assembly]::LoadWithPartialname("Office") > $null # need this or powerpoint might not close
$ppt_app = New-Object "Microsoft.Office.Interop.Powerpoint.ApplicationClass" 


function StoreIPFS {
    param ([parameter(Mandatory=$True,Position=1)] [ValidateScript({ Test-Path -PathType Leaf $_ })] [String] $FilePath )

    Write-Host "StoreIPFS $($FilePath)"
	
    $uri1="https://ipfs.infura.io:5001/api/v0/add?pin=true"
    $uri2="http://diskstation:5002/api/v0/add?pin=true"
    $fileBin = [System.IO.File]::ReadAllBytes($FilePath)
	$enc = [System.Text.Encoding]::GetEncoding("iso-8859-1")
	$fileEnc = $enc.GetString($fileBin)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = (
        "--$boundary",
		"Content-Type: application/octet-stream$LF",
        $fileEnc,
        "--$boundary--$LF"
        ) -join $LF


    try {  $result = Invoke-RestMethod -Uri $uri1 -Method Post -ContentType "multipart/form-data; boundary=`"$boundary`"" -Headers @{ "Origin"="fake://"} -Body $bodyLines }
    catch [System.Net.WebException] {  Write-Error( "REST-API-Call failed for '$URL': $_" ); throw $_ ; }

    try {  $result = Invoke-RestMethod -Uri $uri2 -Method Post -ContentType "multipart/form-data; boundary=`"$boundary`"" -Headers @{ "Origin"="fake://"} -Body $bodyLines }
    catch [System.Net.WebException] {  Write-Error( "REST-API-Call failed for '$URL': $_" ); throw $_ ; }

    # Write-Host $result
    return $result
}


$mdarray1 = @()




Get-ChildItem -Path $curr_path -Recurse -Filter *.ppt? | ForEach-Object {
    Write-Host "Processing powerpoint" $_.FullName "..."
    $document = $ppt_app.Presentations.Open($_.FullName,[Microsoft.Office.Core.MsoTriState]::msoFalse)

    $targetdir=$_.BaseName
    # $targetdir = $targetdir -replace '[^0-9a-zA-Z]', '_'
    $targetdir = "outputpowerpoint"
    $destination = "$($curr_path)\$($targetdir)"

     $clean = "$($curr_path)\$($targetdir)\*.*"
    Remove-Item -Path $clean -Force
    Write-Host $clean
    
    Write-Host "Powerpoint file:" $_.BaseName
    Write-Host "PNG's will be stored here:" $destination


$fnolinks = ($_.BaseName -like '*nolinks*')
write-host "fnolinks" $fnolinks

$filenamecontainschapter = ($_.BaseName -like '*fn_ch*')
write-host "filenamecontainschapter" $filenamecontainschapter

    $powerpointname = $_.BaseName
    $outputTypeImg = [Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType]::ppSaveAsPNG
    $EmbedFonts = [Microsoft.Office.Core.MsoTriState]::msoTrue
    
    $result = $document.SaveAs($destination, $outputTypeImg, $EmbedFonts)
    Write-Host "PNG's saved" $result

    $destname="$($_.BaseName) Sheets.pdf"
    $destname = $destname -replace ' nolinks', ''  #remove info tags
    $destname = $destname -replace ' fn_ch', ''    #remove info tags
    $outputTypeImg = [Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType]::ppSaveAsPDF
    $destinationsheets = "$($curr_path)\$($destname)"
    $result = $document.SaveAs($destinationsheets, $outputTypeImg, $EmbedFonts)
    Write-Host "Entire PDF saved" $result
    $sheetsresult = StoreIPFS ($destinationsheets)
    Write-Host "Stored sheets on ipfs" $ipfs.Name
   #$mdarray1

    $prefixword = $_.BaseName.Split(" ")[0]
    $prefix = ($prefixword+"-").Split("-")[0]
    Write-Host $prefix    

   $chapter=$_.BaseName.Split(" ")[0].Trim()
   if ($chapter -eq "all") { $chapter="*" }

    $mdarray1 += ,@{ chapter=$chapter;title=$destname;cid=$sheetsresult.Name;size=$sheetsresult.Size;source=$powerpointname}   
     #$mdarray1

    $comma=" "
    #$chapter = 0

    $ipfsarray = @()
    
    Get-ChildItem -Path $destination -Recurse -Filter *.PNG | ForEach-Object {
        Write-Host "Processing Sheet" $_.BaseName "..."
        $nr = $_.BaseName -replace '[^0-9]', '' -as [int]
        $result = StoreIPFS ($_.FullName)
        $ipfsarray += ,@{ nr=$nr;Name=$result.Name;Size=$result.Size}
    }
    $ipfsarray =  $ipfsarray | Sort-Object -Property @{Expression = {$_.nr}; Ascending = $true} 


    
    foreach ($ipfs in $ipfsarray) {
        $nr = $ipfs.nr
        #Write-Host $nr

        if (-Not $filenamecontainschapter) {                     
            $topline=0
            $top=10000
            $title="$($chapter) $($powerpointname)"  #initial value (bases on previous chapter#)
            #Write-Host $document.Slides[$nr].Shapes.Count
            For ($z=1; $z -le $document.Slides[$nr].Shapes.Count; $z++) { # find highest line
               if (($document.Slides[$nr].Shapes[$z].Top -le $top) -and ($document.Slides[$nr].Shapes[$z].TextFrame.TextRange.Text.length -ge 1)) {
                    $top = $document.Slides[$nr].Shapes[$z].Top
                    $topline = $z
               }           
            }
            if ( $topline -ge 1) {
                $title = $document.Slides[$nr].Shapes[$topline].TextFrame.TextRange.Text
            }



            #Write-Host $title
            $title = $title.Trim()
            $title = $title -replace '\t', ' '
            $split = $title.Split(" ")
            $chapter = $split[0].Trim()
            $title = $title -replace '\n', ' '
            $title = $title -replace '\r', ' '
            $title = $title.replace($split[0],"")  # strip the leading chapter        

            $title = $title -replace '[^0-9a-zA-Z .-_+()&?!#@$]', ' '

            $title = $title.Trim()    # SubString(0,[math]::min(50,$title.length) ) not nessecary, textOverflow="ellipsis" shows only one line
            $title = $title.Trim(".")
            $comma=","
        }

        $chapterprefixed = $chapter
        if ($chapterprefixed -NotMatch $prefix) {
            $chapterprefixed = "$($prefix)-$($chapterprefixed)"
        }

        Write-Host $chapterprefixed,$title
        

        

        $source = "$($targetdir)-$($nr)" 

        $mdarray1 += ,@{ chapter=$chapterprefixed;title=$title;png=$ipfs.Name;size=$ipfs.Size;source=$source}  #slidenr=$ipfs.nr;


        if (-Not $fnolinks) { #skip to links, usefull for tdfa
                 For ($z=1; $z -le $document.Slides[$nr].Hyperlinks.Count; $z++) { # find all hyperlinks
                   $h = $document.Slides[$nr].Hyperlinks[$z].Address
                   Write-Host $chapterprefixed, $h
                   $mdarray1 += ,@{ chapter=$chapterprefixed;url=$h}   
                }
          }

    }
  
    $document.Close()
}

# now we've got all slides from all presentations

    #$_.BaseName
    $filename = "$($curr_path)\allslides.json"
    Write-Host  $filename   

    $mdarray1 | ConvertTo-Json -depth 100  |  Out-File -Encoding ASCII $filename    # Sort-Object -Property @{Expression = {$_.chapter}; Ascending = $true} |
    $result = StoreIPFS ($filename)
    $end = "Powerpoint $($powerpointname) : $($result.Name)"
    Write-Output $end
    Add-Content "$($curr_path)\ipfs.json" $end

$ppt_app.Quit()

[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();

Stop-Process -name "POWERPNT" -force


