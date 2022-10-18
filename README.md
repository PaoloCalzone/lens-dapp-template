This is a [lens](https://lens.xyz/) with [Next.js](https://nextjs.org/) and [Tailwind](https://tailwindcss.com/) template to bootstrap your web3 social-media dApp 🚀

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
```

## Stack

- apollo
- wagmi
- connectkit

## login flow

1. In that file, the user click on connect button, select its account. Under the hood, Lens API is called for authentication and if the user has got an account, send back a token that is set in localstorage
2. During re-renderig, apollo (link to the file) set the token in his header
3. Login logic(login, logout, errors) is in that file.

## Typescript

Set to `"strict": true`. baseUrl is `"."` so imports are always relative to base directory (no more `"../.."`), and baseUrl is set for `"src/*"` as `"@/*"` and for `"public/images"` as "`@images/*"`
