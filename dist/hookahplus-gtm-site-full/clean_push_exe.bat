@echo off
SETLOCAL

REM Set GitHub upstream branch if not already set
git branch --show-current > temp_branch.txt
set /p BRANCH=<temp_branch.txt
del temp_branch.txt

REM Ensure LFS is active and tracking .exe
git lfs install
git lfs track "*.exe"
git add .gitattributes

REM Commit LFS change
git commit -m "Track .exe files via Git LFS"

REM Remove .exe from history
python -m git_filter_repo --invert-paths --path "*.exe"

REM Force push cleaned repo to origin
git push --set-upstream origin %BRANCH% --force

echo Done! Repo cleaned and pushed.
ENDLOCAL
pause
