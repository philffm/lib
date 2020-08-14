
$scriptpath = $MyInvocation.MyCommand.Path
$curr_path = Split-Path $scriptpath
$filename = "$($curr_path)\allslides.json"
$foo = Get-Content -Raw -Path $filename 

$res = [array] ($foo | Out-String | ConvertFrom-Json)



Write-Host $res
