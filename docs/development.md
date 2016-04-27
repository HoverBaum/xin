# Xin development

## Plans
All of these will be optional modules that can be used with XIN.

We will also provide a "XIN-core" which will be a bundle of the most commonly used packages.

- Databinding
- Templates for sites
- Node implementation
    - Use modules in front and backend
    - only implement xin and modules differently
    - Have modules that make events "ubiquitous" meaning available on front and backend.

## testing

Is a bit tricky right now because we are testing code for frontend brower use that makes XHR requests. To give responses for those you need to run `node test/server.js` before running the actual tests.

But then it is quite straight forward.
```
npm test
```
