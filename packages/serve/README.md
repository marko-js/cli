<div align="center">
  <h1>
    <!-- Logo -->
    @marko/serve 🍦
  </h1>
  <p>
    <!-- Stability -->
    <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
      <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
    </a>
    <!-- NPM Version -->
    <a href="https://npmjs.org/package/@marko/serve">
      <img src="https://img.shields.io/npm/v/@marko/serve.svg" alt="Latest NPM Version"/>
    </a>
    <!-- Downloads -->
    <a href="https://api.npmjs.org/downloads/point/last-week/@marko/serve">
      <img src="https://img.shields.io/npm/dm/@marko/serve.svg" alt="# of Weekly Downloads"/>
    </a>
  </p>
</div>

When you `serve` a directory, every `.marko` file in that directory becomes a page. A browser is automatically launched and live-reloads as you make changes. It's the simplicity of a static file server plus the power of [the Marko UI language](https://markojs.com/).

## Features

- 🚀 Fastest way to build a Marko app
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

## Getting Started

### Hello World

Start by creating and entering a new directory, then serve it [using `npx`](https://docs.npmjs.com/cli/commands/npx) (requires npm 5.2.0+): <!-- TODO: is npm v5.2 old enough that we no longer need this reminder? -->

```sh
mkdir my-new-app
cd my-new-app/
npx @marko/serve .
```

By running `npx @marko/serve`, a browser tab automatically opens for the current working directory. Since our new directory is empty, you should see an empty directory index:

<!-- Chrome screenshots are taken in a guest window with a viewport of 900x296 -->

![A browser viewing the URL of localhost:3000/, which reads “Index of /”.](https://user-images.githubusercontent.com/1958812/60997492-c49b7180-a30b-11e9-866f-b984c94c2a25.png)

Let's make a web page! Create a `hello.marko` file within `my-new-app/` with the following:

```marko
<h1>Hello World</h1>
```

Once you save this file, the directory index will reload and show `hello.marko` as a file:

![The same URL as before, but now the “Index of /” shows a hyperlink to “hello.marko”.](https://user-images.githubusercontent.com/1958812/60997582-fc0a1e00-a30b-11e9-8d21-78c57ea8fcbe.png)

Follow the `hello.marko` hyperlink to view your new page:

![The URL of localhost:3000/hello shows a large heading of “Hello World”.](https://user-images.githubusercontent.com/1958812/60997682-3a9fd880-a30c-11e9-8a9b-7ba5353fb76a.png)

### A custom index

Navigate back to the directory index. Let's create an `index.marko` file with the following:

```marko
<h1>Home</h1>
```

Once you save this file, the directory index will reload and show our custom index instead:

![The URL of localhost:3000/ no longer shows the the “Index of /” page, but instead a heading of “Home”.](https://user-images.githubusercontent.com/1958812/60998579-10e7b100-a30e-11e9-853a-af2cd3773d9a.png)

### Adding a component

Let's add a menu so we can navigate between our pages. Since it’ll be on every page, we'll create it as a component instead of duplicating code for each page.

1. Create a `components/` directory, then add a `main-menu.marko` file inside with the following:

```marko
<nav>
  <a href="/">Home</a>
  -
  <a href="/hello">Hello</a>
</nav>
```

2. Then, add the `<main-menu>` component to both pages:

   ```marko
   <h1>Home</h1>
   <main-menu/>
   ```

   ```marko
   <h1>Hello World</h1>
   <main-menu/>
   ```

3. We can now use the menu to navigate between pages!

   ![The Home page at localhost:3000/ now shows hyperlinks to itself and to “Hello”.](https://user-images.githubusercontent.com/1958812/60999112-332dfe80-a30f-11e9-9ef6-4f5254a7e19a.png)

### Route params

What if we want our app to say "Hello" to more than the world? Do we need a new `.marko` file for each thing we want to say hello to?

_Nope._ This is where route parameters come in. **Route parameters** let you use dynamic values from the URL in your templates. Like normal pages, these are powered by your directory structure, but add a special syntax: filenames that contain keywords in square brackets (like `[example]`) create a parameter with the same name as the text between the brackets.

1. Rename `hello.marko` to `hello/[name].marko`, and update its contents to:

   ```marko
   <h1>Hello ${input.params.name}</h1>
   <main-menu/>
   ```

2. Try [visiting `http://localhost:3000/hello/params`](http://localhost:3000/hello/params) in your browser.

  ![The page at localhost:3000/hello/params shows a heading of “Hello params”.](https://user-images.githubusercontent.com/1958812/61000022-62de0600-a311-11e9-98e8-c20dee1ad434.png)

3. The possibilities are endless! Try adding a few to your menu:

   ```marko
   <nav>
     <a href="/">Home</a>
     -
     <a href="/hello/marko">Marko</a>
     -
     <a href="/hello/params">Params</a>
     -
     <a href="/hello/world">World</a>
   </nav>
   ```

### Go forth and build

When you're ready to let the world see what you've built, run [the `build` command](../build/README.md) to get a production-ready app:

```sh
npx @marko/build .
```

This produces a `build/` directory that contains the app and its assets, all optimized and compressed.

We no longer need `@marko/serve`, `@marko/build`, or any other dependencies. We can run the server using only `node`:

```sh
node build/index.js
```

[Open your browser to `http://localhost:3000/`](http://localhost:3000/) and you'll see the same app, only faster.

![The homepage with a menu of links to “Home”, “Marko”, “Params”, and “World”.](https://user-images.githubusercontent.com/1958812/61000788-0da2f400-a313-11e9-892e-b95f5a0d2e0e.png)

This `build/` directory can now be deployed to your favorite hosting service. We're excited to see what you make! ✨

## CLI

### Installation

```sh
npm install --save-dev @marko/serve
```

### Examples

```sh
marko-serve .                           # serve the current directory
marko-serve ./pages                     # serve a “pages” directory
marko-serve ./components/example.marko  # serve a single component
marko-serve . --inspect-brk             # debug by passing a node argument through
```

### Options

- `--port -p`: The port to serve on (default `3000`)
- `--no-browser`: Don't automatically open the browser
- `--verbose`: Show the entire raw build output
- [Any `node` CLI arguments](https://nodejs.org/api/cli.html) are passed to the Node.js server process

## API

> **Warning**:
> Don't import the `@marko/serve` package directly yet. A programmatic API is coming soon.
