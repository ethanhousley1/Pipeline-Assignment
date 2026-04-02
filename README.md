# Pipeline-Assignment

## Local Dev

### Install Supabase

Windows:

```
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

MacOS:

```
brew install supabase/tap/supabase
```

### Run Local

Use Bun. Here is a [link](https://bun.com/) to easily install it. Its a very very fast Node and NPM replacement.

```
bun i
bun dev:up
bun migrate
bun dev
```
