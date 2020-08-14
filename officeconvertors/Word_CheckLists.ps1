#This script export word files (in the current directory and below).
#All slides are converted to png files and stored on IPFS
#A list of the slides (including number, title, IPFS hash) are stored in a .json file
#The json file is also stored on IPFS



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
$word_app.Visible = $false

   


Get-ChildItem -Path $curr_path -Recurse -Filter *.doc? | ForEach-Object {
    Write-Host "Processing word" $_.FullName "..."
    $document = $word_app.Documents.Open($_.FullName)
    $destination = "$($curr_path)\$($_.BaseName)"
    $wordname = $_.BaseName    
    Write-Host $wordname
    $range = $document.content

   


    $Document.Lists | ForEach-Object {
        $format=$_.Range.ListFormat.ListString     
        if ($format -Match '3.') {
             Write-Host $format $_.ListParagraphs.count

            $_.ListParagraphs | ForEach-Object {
               $_.Range.Text
            }
        }
     }

#    $Document.Paragraphs | ForEach-Object {     
#        if ($_.Style.NameLocal -Match 'Kop') {
#           $newtitle = "$($_.Range.ListFormat.ListString) $($_.Range.Text)".Trim()           
#           Write-Host $newtitle 
#        }
#    } 
    $document.Close()
}

$word_app.Quit()

[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();

Stop-Process -name "WINWORD" -force -ErrorAction SilentlyContinue


