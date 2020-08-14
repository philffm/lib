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

    #SaveCopy($chapter,$_.Text)
function SaveCopy {
    param ($chapter,$text)
    Write-Host SaveCopy $chapter $text
    $text = $text.trim() -replace '[^0-9a-zA-Z]', '_'
    $text = $text.Trim("_")
    $destination = "$($curr_path)\outputword\$($chapter) $($text).pdf"
    $word_appcopy = New-Object "Microsoft.Office.Interop.Word.ApplicationClass"         
    $word_appcopy.Visible = $false
    $document = $word_appcopy.documents.add()   

    $document.Content.Paste()
    $document.Content.InsertParagraphBefore()
    $document.Content.InsertBefore("$($chapter) $($text)")

    $outputTypePDF = 17 # wdSaveAsPDF
    
    $document.SaveAs($destination,$outputTypePDF)

    $doNotSaveChanges = [Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges

    $document.Close([ref]$doNotSaveChanges)
    $word_appcopy.Quit()
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()

    return StoreIPFS($destination)
}
 
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


Get-ChildItem -Path $curr_path -Recurse -Filter *.doc? | ForEach-Object {
    Write-Host "Processing word" $_.FullName "..."
    $document = $word_app.Documents.Open($_.FullName)
    $destination = "$($curr_path)\$($_.BaseName)"
    $wordname = $_.BaseName
    
    Write-Host $wordname

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
    $chapter = "0"
    $prevtext = "before first id"
    $previd=""
    #$mdarray1 = @()
    $mdarray1 = [array] (Get-Content "allslides.json" | ConvertFrom-Json)
    #Write-Host        $mdarray1
    $Document.Sentences | ForEach-Object { 
    
    

        if ( ($_.ListFormat.ListLevelNumber -ge 3) -and ($_.ListFormat.ListString -Match '3.'))  { #($_.Font.Bold -eq -1) -and
            Write-Host $_.Text
            Write-Host  $_.ListFormat.ListLevelNumber       

            $inbetween=$Document.Range($prev, $_.Start)
            $prev = $_.End
          #  Write-Host $previd $inbetween.Paragraphs.Count
            $inbetween.Hyperlinks | ForEach-Object {                
                if ($_.Address -ne $prevurl) {
                  #  Write-Host $chapter $_.Address
                    $mdarray1 += ,@{ chapter=$chapter;url=$_.Address;}  #title=$_.TextToDisplay
                    $prevurl = $_.Address
                }
            }

            $inbetween.copy() | out-null;
            $result=SaveCopy $chapter $prevtext  # note: space seperated
            $mdarray1 += ,@{ chapter=$chapter;cid=$result.Name;title="$($chapter) $($prevtext)"} 

            #$mdarray1 += ,@{ chapter=$chapter;url=$_.Address;}  #title=$_.TextToDisplay

            $previd = $_.ListFormat.ListString
            $chapter = "BC-$($previd)"
            $prevtext = $_.Text
            $prevtext = $prevtext.trim() -replace '[^0-9a-zA-Z]', '_'
            $prevtext = $prevtext.trim("_")

            Write-Host $chapter.PadRight(15,' ') $prevtext
        }

        $veryend=$_.End
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
      $inbetween.copy() | out-null;
      $result=SaveCopy $chapter $prevtext  # note: space seperated
     $mdarray1 += ,@{ chapter=$chapter;cid=$result.Name;title="$($chapter) $($prevtext)"} 



    $document.Close()
    # $_.BaseName
    $filename = "$($curr_path)\allword.json"
    Write-Host  $filename   
    $mdarray1 | Sort-Object -Property @{Expression = {$_.chapter}; Ascending = $true},@{Expression = {$_.source}; Ascending = $true} | ConvertTo-Json -depth 100  |  Out-File -Encoding ASCII $filename  
    $result = StoreIPFS ($filename)
    $end = "$($_.BaseName) : $($result.Name)"
    Write-Output $end
    Add-Content "$($curr_path)\ipfs.json" $end

}



$word_app.Quit()

[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();

Stop-Process -name "WINWORD" -force -ErrorAction SilentlyContinue


