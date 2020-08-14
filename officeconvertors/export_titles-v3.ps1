$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
[Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Powerpoint") > $null
[Reflection.Assembly]::LoadWithPartialname("Office") > $null # need this or powerpoint might not close
$ppt_app = New-Object "Microsoft.Office.Interop.Powerpoint.ApplicationClass" 
Get-ChildItem -Path $curr_path -Recurse -Filter *.ppt? | ForEach-Object {
    Write-Host "Processing" $_.FullName "..."
    $document = $ppt_app.Presentations.Open($_.FullName)
    $filename = "$($curr_path)\$($_.BaseName).json"
    $exportPath = $pdf_filename
    $defaultname = $_.BaseName
    $counter = 1
    $leadnumber="0"

    Set-Content $filename "["
    $comma=""

    For ($i=1; $i -le $document.Slides.Count; $i++) {
    Write-Output $i 

        For ($z=1; $z -le $document.Slides[$i].Shapes.Count-1; $z++) {

            Write-Output $document.Slides[$i].Shapes[$z].TextFrame.TextRange.Text
        }

        $title = $document.Slides[$i].Shapes[1].TextFrame.TextRange.Text
        if (($title  -eq "") -or ($title -eq $null)) {
            $title = $document.Slides[$i].Shapes[2].TextFrame.TextRange.Text
        }
        if (($title  -eq "") -or ($title -eq $null)) { #still nothing found
            $title = $defaultname
        }
       # $title = $title -replace ' ', '_'
        $title = $title -replace '\t', ' '
        $title = $title -replace '\n', ' '
        $title = $title -replace '\r', ' '
       # $title = $title -replace '-', '_'
       # $title = $title -replace '[^a-zA-Z0-9.+_-]', ''        # not neccesary any more
       # $title = $title -replace '__', '_'
       # $title = $title -replace '__', '_'
       # $title = $title -replace '__', '_'
       # $title = $title -replace '__', '_'
        $title = $title.SubString(0,[math]::min(50,$title.length) )
        $title = $title.Trim()
       
        
        $split =$title.Split(" ")   #$tmp -join "."
        #Write-Output $split[0]


        if ($split[0] -match '[^0-9A-Z\.]')  { #chech if there is anything except 1.2.3.4...A-Z
           # Write-Output "not just number"
           # $leadnumber stays the same
        } else { # just numbers and a few letters
             # Write-Output $split[0]
            if ( $split[0] -match '[0-9]') { # at least one digit, to prevent matching text only
                $title = $title.replace($split[0],"")  # strip the leading number
                $title = $title.Trim(" ")
                $leadnumber=$split[0].Trim(".")
            }
        }     
            
        if ($defaultname -eq $title) { # same as previous
            $counter = $counter+1
        } else {
            $counter = 1
        }
        
        $exporti = "$($comma){ ""slidenr"":$($i),""chapter"":""$($leadnumber)"",""title"":""$($title)_$($counter)""}"
        $comma=","
        $defaultname = $title

        Write-Output $exporti
        Add-Content $filename $exporti
    }    
    Add-Content $filename "]"

    $document.Close()
}
$ppt_app.Quit()
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
[System.GC]::Collect();
[System.GC]::WaitForPendingFinalizers();
