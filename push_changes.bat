@echo off
cd /d "c:\projects\proj\hackstate\H-TeamState"
echo Staging changes in %CD%...
git add .
echo Committing changes...
git commit -m "Update from agent"
echo Pushing changes...
git push origin main
echo Done.
pause
