@echo off
set zipname=project.zip

powershell -command "Compress-Archive -Path app,bootstrap,database,lang,public,resources,routes -DestinationPath %zipname% -Force"

echo Selesai bikin %zipname%
pause