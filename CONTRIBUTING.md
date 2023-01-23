# Contributing

Welcome aboard as an Popcorn developer.

This document will get you up to speed on our expectations for contributing to the codebase. Please read through this and our [code of conduct](./CODE_OF_CONDUCT.md).

## Trunk-based Development workflow

The trunk-based development workflow is one of the most popular development frameworks among developer teams. In this workflow, only a single branch (trunk) is considered the main one. It holds the project’s deployable code.

A developer can directly push changes to the `main` branch, but if a coding activity requires more extensive time — perhaps a few days — they can check out a branch from `main`, move the changes into it, then merge it back in when development is complete.

Fellow developers must then perform a code review based on company guidelines before merging the checked-out branch with the main branch. The crucial thing about checked-out branches is that they are short-lived, spanning two to three days at most.

In a trunk-based workflow, the main branch should always be production-ready. Faulty code can break the entire build and result in a complicated development history. That means that teams should thoroughly test each code change before pushing them to the main branch. Short development cycles and automated testing enable teams to identify defects and recover from failed builds quickly, reducing the risk.

Using the trunk-based workflow requires that there are experienced developers on the team. Junior or inexperienced members need a sufficient understanding of the workflow before they can contribute to the project.

Read more about trunk-based development workflow here: https://circleci.com/blog/trunk-vs-feature-based-dev

## Submitting features/bug fixes:

- Larger features that will take more than a day (this should be rare!) are branched off of `main`. To create a new feature, create a new branch off of `main` with the name: `feature/name-of-feature`. This naming is important because it helps with organization.
- To submit a bug fix create a new branch off of develop with the name `bugfix/name-of-bug`
- When your feature is ready for QA, create a pull request and share a link to the pull request

## Code standards

- All code is subject to review. If it does not meet quality standards, it may not be merged until the issues are addressed;

### General guidelines:

_Function length_: functions should **rarely be greater than 20 lines of code**. Exceptions can be made. Please do not submit a PR unless the code has been refactored in an attempt to meet this standard.

_Declarative vs imperative_ - When possible aim to write declarative code. https://tylermcginnis.com/imperative-vs-declarative-programming/

_Use classes or es6 modules_ - Consider using classes or es6 modules to contain your code - https://exploringjs.com/es6/ch_modules.html#sec_basics-of-es6-modules

_Consider the SOLID principles_ - Keeping each of these principles in mind while writing software helps to create high-quality software: https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design

_Make code modular, and resuable_ - Code is more modular, portable and easily tested when dependencies are added as arguments. Consider the unix approach: The Unix philosophy emphasizes building simple, compact, clear, modular, and extensible code that can be easily maintained and repurposed by developers other than its creators. The Unix philosophy favors composability as opposed to monolithic design.

_const vs let vs var_ - Always prefer `let` over `var`. Always prefer `const` to `let` when a variable does not need to be reassigned. Avoid variable reassignment. This makes code easier to understand and less prone to bugs.

_any types_ - when writing in typescript avoid using `any` types - aim to create interfaces for the inputs and outputs of your functions. Consider the [interface segratation principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) when defining interfaces. On very rare occassions it is ok to use `any`.

## Style guide

If you elect to use VS Code, maintaining a consistent style is easy because of the prettier integration.

Regardless, please ensure that you are using 2 space tabs.

## Inclusive language: replacement terms

In an effort to develop software with language free from expressions or words that reflect prejudice the following terminology is recommended instead of blacklist/whitelist and master/slave:

Replace blacklist/whitelist with:

```
blocklist  / allowlist
exclude list / include list
avoid list / prefer list
```

Replace master/slave with:

```
leading / subordinate
source / replica
```

## Recommended Tools:

- `vscode` - because we are using typescript this is very important to download. It makes the development experience much easier. free download available here: https://code.visualstudio.com/
  - recommended plugins:
  - gitlens
  - Move TS
  - ESLint
  - Docker
  - Prettier
  - Todo Tree
  - TSLint
