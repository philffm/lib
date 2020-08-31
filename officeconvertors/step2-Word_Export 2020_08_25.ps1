#This script export word files (in the current directory and below).
#All slides are converted to png files and stored on IPFS
#A list of the slides (including number, title, IPFS hash) are stored in a .json file
#The json file is also stored on IPFS
#The firstpart of the filename is used as a prefix that should be present in the chapters



#Stop-Process -name "WINWORD" -force -ErrorAction SilentlyContinue




$oldword = Get-Process "WINWORD"   -ErrorAction SilentlyContinue

if ($oldword) {
  # try gracefully first
  $oldword.CloseMainWindow() | Out-Null
  # kill after five seconds
  Sleep 5
  if (!$oldword.HasExited) {
    $oldword | Stop-Process -Force
  }
}

 Write-Host "Start"



$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
[Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Word") > $null
[Reflection.Assembly]::LoadWithPartialname("Office") > $null # need this or word might not close
$word_app = New-Object "Microsoft.Office.Interop.Word.ApplicationClass" 
$word_app.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

    #SaveCopy($chapter,$_.Text)
function SaveCopy {
    param ($range,$chapter,$text)
    Write-Host SaveCopy $chapter $text

    if (-Not (Test-Path .\outputword)) { New-Item -ItemType directory -Path .\outputword }
    $text = $text.trim() -replace '[^0-9a-zA-Z]', '_'
    $text = $text.Trim("_")
  
    $destination = "$($curr_path)\outputword\$($chapter) $($text).pdf"
    #$word_appcopy = New-Object "Microsoft.Office.Interop.Word.ApplicationClass"         
   # $word_appcopy.Visible = $false
    #$document = $word_appcopy.documents.add()   

    #$document.Content.Paste()
    #$document.Content.InsertParagraphBefore()
    #$document.Content.InsertBefore("$($chapter) $($text)")

    $outputTypePDF = 17 # wdSaveAsPDF
    
    #$document.SaveAs($destination,$outputTypePDF)

    Write-Host "Exporting" $destination
    $range.ExportAsFixedFormat2($destination,$outputTypePDF)



    #$doNotSaveChanges = [Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges

    #$document.Close([ref]$doNotSaveChanges)
    #$word_appcopy.Quit()
    #[GC]::Collect()
    #[GC]::WaitForPendingFinalizers()

    return StoreIPFS($destination)
  #return ""
}
 
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


    $mdarray1 = [array] (Get-Content "allslides.json" | ConvertFrom-Json)
    
    
    
Get-ChildItem -Path $curr_path -Recurse -Filter *.doc? | ForEach-Object {
    Write-Host "Processing word" $_.FullName "..."
    $document = $word_app.Documents.Open($_.FullName)
    $destination = "$($curr_path)\$($_.BaseName)"
    $wordname = $_.BaseName
    
    Write-Host $wordname
    $prefix = $wordname.Split(" ")[0]+"."
    Write-Host $prefix

    $range = $document.content

   # Write-Host $range.Characters.count
    
#    $Document.Hyperlinks | ForEach-Object { Write-Host $_.Address  $_.TextToDisplay }
#    $Document.Range().paragraphs | foreach {$_.range.text}
#    $Document.Paragraphs | ForEach-Object { Write-Host $_.Range.Text }
#    Write-Host $_.Text 
#    Write-Host $_.Font.Bold
#    Write-Host $_.Style.NameLocal
#    Write-Host $_.Range.Font.Bold
#    Write-Host $_.Font.Bold
#    Write-Host $_.Range.Text
#    if (($_.Text -Match 'further') -and ($_.Text -Match 'reading') )  {      
#    Write-Host   $_.ListFormat.ListValue 

    $prev=$document.range.Start
    $prevurl=""
    $veryend=""
    $chapter = "skip"
    $prevtext = "before first id"
    $previd=""

    $Document.Paragraphs | ForEach-Object {     
    #Write-Host  $_.Range.Text
        if ($_.Style.NameLocal -Match 'Kop') {
           $newtitle = "$($_.Range.ListFormat.ListString) $($_.Range.Text)".Trim()
           $newtitle = $newtitle -replace '\t', ' '
Write-Host "Analyzing" $newtitle
           $split = $newtitle.Split(" ")
           if ($split[0].length -eq 0) {
                $newchapter="None"
                $newtitle="None"
            } else {          
                $split0 = $split[0].Trim()
                $newchapter = $split0
                $newtitle = $newtitle.replace($split0,"").Trim()  # strip the leading chapter        
           }
           $newtitle = $newtitle -replace '[^0-9a-zA-Z]', '_'
           $newtitle = $newtitle.trim("_") 

Write-Host $newchapter
           if ($newchapter -Match $prefix) {
               Write-Host  "KOP:"  $newchapter $newtitle
               $inbetween=$Document.Range($prev, $_.Range.Start)
               $prev = $_.Range.Start
               $inbetween.Hyperlinks | ForEach-Object {                
                    if ($_.Address -ne $prevurl) {
                      #  Write-Host $chapter $_.Address
                        $mdarray1 += ,@{ chapter=$chapter;url=$_.Address;}  #title=$_.TextToDisplay
                        $prevurl = $_.Address
                    }
                }
                if ($chapter -ne "skip") {
                    $copylength=$inbetween.Characters.Count.ToString()
                    if ($copylength -gt 1) {
                       # $inbetween.copy() | out-null;
                        $result=SaveCopy $inbetween $chapter $prevtext  # note: space seperated
                        $mdarray1 += ,@{ chapter=$chapter;cid=$result.Name;title="$($chapter) $($prevtext)"} 
                    }
                }
                $previd = $newchapter 

                 if ($previd -NotMatch 'BC') {
                     $chapter = "BC-$($previd)"
                 }
                 else {
                        $chapter = $previd  # already included BC
                 }
                $prevtext = $newtitle
                Write-Host $chapter.PadRight(15,' ') $prevtext
            }
        }
        $veryend=$_.Range.End
    } 

    #Write-Host  "end" $document.range.End

    $inbetween=$Document.Range($prev, $veryend)   # for the last part
  #  Write-Host $previd $inbetween.Paragraphs.Count
    $inbetween.Hyperlinks | ForEach-Object {                
        if ($_.Address -ne $prevurl) {
            Write-Host $chapter $_.Address            
            $mdarray1 += ,@{ chapter=$chapter;url=$_.Address;} #title=$_.TextToDisplay
            $prevurl = $_.Address
        }
    }
      #$inbetween.copy() | out-null;
      $result=SaveCopy $inbetween $chapter $prevtext  # note: space seperated
     $mdarray1 += ,@{ chapter=$chapter;cid=$result.Name;title="$($chapter) $($prevtext)"} 


     $result=SaveCopy $document.content "Literature" "" # note: space seperated
     $mdarray1 += ,@{ chapter="*";cid=$result.Name;title="Literature"} 


    $document.Close()
}    
    
    
    # $_.BaseName
    $filename = "$($curr_path)\allword.json"
    Write-Host  $filename   
    $mdarray1 | Sort-Object -Property @{Expression = {$_.chapter}; Ascending = $true},@{Expression = {$_.source}; Ascending = $true} | ConvertTo-Json -depth 100  |  Out-File -Encoding ASCII $filename  
    $result = StoreIPFS ($filename)
    $end = "Word $($wordname) : $($result.Name)"
    Write-Output $end
    Add-Content "$($curr_path)\ipfs.json" $end





$word_app.Quit()

[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();

Stop-Process -name "WINWORD" -force -ErrorAction SilentlyContinue


