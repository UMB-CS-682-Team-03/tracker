# Setup

```sh
# Clone mercurial repository.
hg clone http://hg.code.sf.net/p/roundup/code roundup

# Navigate to roundup, then git clone tracker only repo.
cd roundup
git clone https://github.com/UMB-CS-682-Team-03/tracker.git

# Init the demo tracker
python3 demo.py -b sqlite

# Move the files from tracker dir to demo dir
cp -r ./tracker/**/* ./demo
cp -r ./tracker/.git ./tracker/.gitignore ./demo

# Delete the tracker dir
rm -rf ./tracker

# Now you are setup open the roundup folder in VScode.
# Any new changes are only to be done in demo dir
# git is initialised to track origin in demo dir
```
