#This script export word files (in the current directory and below).
#All slides are converted to png files and stored on IPFS
#A list of the slides (including number, title, IPFS hash) are stored in a .json file
#The json file is also stored on IPFS

$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
[Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Word") > $null
[Reflection.Assembly]::LoadWithPartialname("Office") > $null # need this or word might not close
$word_app = New-Object "Microsoft.Office.Interop.Word.ApplicationClass" 

 

 
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

    Write-Host $range.Characters.count
    
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
    $chapter = "before first id"
    $previd=""
    $mdarray1 = @()
    $Document.Sentences | ForEach-Object { #Write-Host $_.Text
        if (($_.Font.Bold -eq -1) -and ($_.ListFormat.ListLevelNumber -ne 1) -and ($_.ListFormat.ListString -Match '3.'))  {
            

            $inbetween=$Document.Range($prev, $_.End)
            $prev = $_.End
            Write-Host $previd $inbetween.Paragraphs.Count
            $inbetween.Hyperlinks | ForEach-Object {                
                if ($_.Address -ne $prevurl) {
                    
                    $mdarray1 += ,@{ chapter=$chapter;url=$_.Address;title=$_.TextToDisplay}
                    $prevurl = $_.Address
                }
            }
            $previd = $_.ListFormat.ListString
            $chapter = "BC-$($previd)"
            Write-Host $chapter  $_.Text
        }

        $veryend=$_.End
    } 

    #Write-Host  "end" $document.range.End

    $inbetween=$Document.Range($prev, $veryend)   # for the last part
    Write-Host $previd $inbetween.Paragraphs.Count
    $inbetween.Hyperlinks | ForEach-Object {                
        if ($_.Address -ne $prevurl) {
            
            $mdarray1 += ,@{ chapter=$chapter;url=$_.Address;title=$_.TextToDisplay}
            $prevurl = $_.Address
        }
    }

    $document.Close()

    $filename = "$($curr_path)\$($_.BaseName).json"
    Write-Host  $filename   
    $mdarray1 | ConvertTo-Json -depth 100  |  Out-File -Encoding ASCII $filename  
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


