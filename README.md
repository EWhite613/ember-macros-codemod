# ember-macros-codemod

Forked from: https://github.com/concordnow/ember-macros-codemod

A collection of codemod's for [ember-macro-helpers](https://github.com/kellyselden/ember-macro-helpers) & [ember-awesome-macros](https://github.com/kellyselden/ember-awesome-macros).

## Usage

Clone repo and run `npm link`



To run a specific codemod from this project, you would run the following:

```
ember-macros-codemod revert-computed-macro path/of/files/ or/some**/*glob.js
```

This transform simply removes the usage of ember-macro-helpers/computed and nothing more.

### Issues
* Will add variable even if not used from function before. Can just remove as need be (or PR fix), was not a common occurence in my code to have unused dependency
* Unused imports, as rather than trying to determine if will eventually use import just added import regardless. Having eslint rule/plugin described here (https://simondosda.github.io/posts/2021-05-10-eslint-imports.html) enabled a way to autofix the rule (as opposed to common rule which has no autofix cause too dangerous assumption to do generally).

### Reasoning for fork
Tried using the original `revert-macros` but it did not seem to work and handled multiple other cases. So after trying to get it work I made a much more single focus code mode for my needs.

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`
