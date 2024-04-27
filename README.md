# ember-macros-codemod

Forked from: https://github.com/concordnow/ember-macros-codemod

A collection of codemod's for [ember-macro-helpers](https://github.com/kellyselden/ember-macro-helpers)

## Usage

```bash
npm install -g ember-macros-codemod
```

To run a specific codemod from this project, you would run the following:

```bash
ember-macros-codemod revert-computed-macro path/of/files/ or/some**/*glob.js
```

This transform simply removes the usage of ember-macro-helpers/computed and nothing more.

### Issues
* Will add variable even if not used from function before. Can just remove as need be (or PR fix), was not a common occurence in my code to have unused dependency

### Reasoning for fork
Tried using the original `revert-macros` but it did not seem to work and handled multiple other cases. So after trying to get it work I made a much more single focus code mode for my needs.

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `npm install`
