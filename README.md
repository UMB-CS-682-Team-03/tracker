# Setup

### For UNIX
```sh
    python3 -m venv .
    . /bin/activate
    python3 -m pip install roundup

    # If venv is setup properly then this command should work
    roundup-admin help
```

### For Windows Powershell

```powershell
    # Optional
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

    python -m venv .
    .\Scripts\activate
    python -m pip install roundup

    # If venv is setup properly then this command should work
    roundup-admin help
```

## To start the server

```sh
    roundup-server classhelper=./classhelper
```

```powershell
    roundup-server classhelper=.\classhelper
```