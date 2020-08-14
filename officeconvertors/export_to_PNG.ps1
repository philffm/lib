
$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
[Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Powerpoint") > $null
[Reflection.Assembly]::LoadWithPartialname("Office") > $null # need this or powerpoint might not close
$ppt_app = New-Object "Microsoft.Office.Interop.Powerpoint.ApplicationClass" 


function StoreIPFS {
    param ([parameter(Mandatory=$True,Position=1)] [ValidateScript({ Test-Path -PathType Leaf $_ })] [String] $FilePath )

    Write-Host "StoreIPFS $($FilePath)"
	
    $uri="https://ipfs.infura.io:5001/api/v0/add?pin=true"
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
    try {  $result = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=`"$boundary`"" -Body $bodyLines }
    catch [System.Net.WebException] {  Write-Error( "REST-API-Call failed for '$URL': $_" ); throw $_ ; }
    # Write-Host $result
    return $result
}


Get-ChildItem -Path $curr_path -Recurse -Filter *.ppt? | ForEach-Object {
    Write-Host "Processing powerpoint" $_.FullName "..."
    $document = $ppt_app.Presentations.Open($_.FullName)
    $destination = "$($curr_path)\$($_.BaseName)"
    $powerpointname = $_.BaseName
    $outputTypeImg = [Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType]::ppSaveAsPNG
    $EmbedFonts = [Microsoft.Office.Core.MsoTriState]::msoTrue
    Write-Host $destination
    $result = $document.SaveAs($destination, $outputTypeImg, $EmbedFonts)
    Write-Host $result
    
    $comma=" "
    $chapter = 0

    $ipfsarray = @()
    
    Get-ChildItem -Path $destination -Recurse -Filter *.PNG | ForEach-Object {
        Write-Host "Processing Sheet" $_.BaseName "..."
        $nr = $_.BaseName -replace '[^0-9]', '' -as [int]
        $result = StoreIPFS ($_.FullName)
        $ipfsarray += ,@{ nr=$nr;Name=$result.Name;Size=$result.Size}
    }
    $ipfsarray =  $ipfsarray | Sort-Object -Property @{Expression = {$_.slidenr}; Ascending = $true} 


    $mdarray1 = @()
    foreach ($ipfs in $ipfsarray) {
        $nr = $ipfs.nr
        #Write-Host $nr
 
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

        $title = $title.SubString(0,[math]::min(50,$title.length) ).Trim()
        $title = $title.Trim(".")
        $comma=","
        Write-Host $nr,$chapter,$title
        
        $mdarray1 += ,@{ slidenr=$ipfs.nr;chapter=$chapter;title=$title;png=$ipfs.Name;size=$ipfs.Size}
    }


    $filename = "$($curr_path)\$($_.BaseName).json"
    Write-Host  $filename   
    $mdarray1 | Sort-Object -Property @{Expression = {$_.slidenr}; Ascending = $true} | ConvertTo-Json -depth 100  |  Out-File -Encoding ASCII $filename  
    $result = StoreIPFS ($filename)
    $end = "$($_.BaseName) : $($result.Name)"
    Write-Output $end
    Add-Content "$($curr_path)\ipfs.json" $end

        
    $document.Close()
}



$ppt_app.Quit()

[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();

Stop-Process -name "POWERPNT" -force


