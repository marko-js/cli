<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/serve
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/serve">
    <img src="https://img.shields.io/npm/v/@marko/serve.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/serve">
    <img src="https://img.shields.io/npm/dm/@marko/serve.svg" alt="Downloads"/>
  </a>
</h1>

When you serve a directory, every `.marko` file in that directory becomes a page. A browser is automatically launched and live-reloads as you make changes. It's the simplicity of a static file server plus the power of the Marko UI language.

# Features

- 🚀 Fastest way to build an app with Marko
- 💖 No need to configure webpack, babel, etc.
- ⚡️ Pages live-reload as you make changes
- 📁 Directory-based routes
- 💯 Supports route parameters (`/blog/:id`)
- 🛠 Serve a single component to work on it in isolation

And when you [`build`](../build/README.md) your production-ready app:

- 🔥 Blazing fast server-side rendering
- 📦 Optimized bundles with automatic code splitting
- ✨ Modern JS & CSS for modern browsers, legacy JS & CSS for legacy browsers

<!--
- 🔮 Option to [pre-render]() to static HTML (great for GitHub Pages, Netlify, etc.)
-->

# Getting Started

## Hello World

To get started, let's create a new directory and serve it using `npx` (requires npm 5.2.0+):

```bash
mkdir my-new-app
cd my-new-app
npx marko-cli serve .
```

When you serve a directory, a browser tab is automatically opened. Since this directory is empty, you should now be looking at an empty directory index.

<!-- chrome screenshots are taken in a guest window with a page dimension of 900x296 -->

![empty directory index](https://user-images.githubusercontent.com/1958812/60997492-c49b7180-a30b-11e9-866f-b984c94c2a25.png)

Let's get some content in there! Create a `hello.marko` file within `my-new-app` with the following content:

```marko
<h1>Hello World</h1>
```

Once you save this file, the directory index will reload and show `hello.marko` as a file in the directory.

![hello.marko in directory index](https://user-images.githubusercontent.com/1958812/60997582-fc0a1e00-a30b-11e9-8d21-78c57ea8fcbe.png)

Click on it to view the new page. Nice!

![hello page](https://user-images.githubusercontent.com/1958812/60997682-3a9fd880-a30c-11e9-8a9b-7ba5353fb76a.png)

## A custom index

Navigate back to the directory index. Let's create an `index.marko` file with the following content:

```marko
<h1>Home</h1>
```

Once you save this file, the directory index will reload and show our custom index instead.

![home page](https://user-images.githubusercontent.com/1958812/60998579-10e7b100-a30e-11e9-853a-af2cd3773d9a.png)

## Adding a component

Let's add a menu so we can easily navigate between our two pages. Since we'll be adding this to each page, we'll create it as a component instead of duplicating code on each page. Create a `components/` directory and add a `main-menu.marko` file inside with the following content:

```marko
<nav>
  <a href="/">Home</a> -
  <a href="/hello">Hello</a>
</nav>
```

And then we'll add the `<main-menu>` component to both of our pages:

```marko
<h1>Home</h1>
<main-menu/>
```

```marko
<h1>Hello World</h1>
<main-menu/>
```

We can now use the menu to navigate between pages!

![home with menu](https://user-images.githubusercontent.com/1958812/60999112-332dfe80-a30f-11e9-9ef6-4f5254a7e19a.png)

## Route params

What if we want our app to be able to say "Hello" to more than just the world? Do we need to create a new page for each thing we want to say hello to?

**Nope**. This is where route parameters come in. Route parameters allow you to use dynamic values from the url in your template. Just like normal pages, these are powered by your directory structure, but use a special syntax: files or directories that start with `:` indicate a parameter. Let's rename `hello.marko` to `hello/:name.marko` and update its contents to the following:

```marko
<h1>Hello ${input.params.name}</h1>
<main-menu/>
```

Try visiting [http://localhost:3000/hello/params](http://localhost:3000/hello/params) in your browser.

![hello params page](https://user-images.githubusercontent.com/1958812/61000022-62de0600-a311-11e9-98e8-c20dee1ad434.png)

The possibilities are endless! Let's add a few to our menu:

```marko
<nav>
  <a href="/">Home</a>-
  <a href="/hello/marko">Marko</a> -
  <a href="/hello/params">Params</a> -
  <a href="/hello/world">World</a>
</nav>
```

## Go forth and build

When you're ready to let the world see what you've built, run the [`build`](../build/README.md) command to get a production-ready app.

```
npx marko-cli build .
```

This produces a `build/` directory that contains the app and its assets, all optimized and compressed. We no longer need `serve`, `build` or any other dependencies. We can run the server using just `node`:

```
node build/index.js
```

Open your browser to [http://localhost:3000/](http://localhost:3000/) and you'll see the same app, only faster.

![image](https://user-images.githubusercontent.com/1958812/61000788-0da2f400-a313-11e9-892e-b95f5a0d2e0e.png)

This build directory can now be deployed to your favorite hosting service. We're exicited to see what you come up with! ✨

# CLI

## Installation

```bash
npm install marko-cli
```

## Example

```bash
marko serve .                                # serve the current directory
marko serve ./pages                          # serve a pages directory
marko serve ./components/my-component.marko  # serve a single component
```

## Options

- `--port -p`: The port to serve on
- `--no-browser`: Don't automatically open the browser
- `--verbose`: Show the raw build output
- [node arguments](https://nodejs.org/api/cli.html) are passed to the server process

# API

Do not use the `@marko/serve` package directly. A programatic API is coming soon.
