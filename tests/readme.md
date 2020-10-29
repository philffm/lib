# Jest tests
We use Jest to test our written code. With the goal to improve the code by catching possible errors/fails and saving 
time in the end. In this ReadMe we will explain how to start and run them. 

## Table of Contents
1. [Installation](#Installation)
2. [Usage](#Usage)
3. [Workflow](#Workflow)
4. [Write a test](#Write-a-test)
5. [Sources](#Sources)


## Installation
Clone repository:
```
https://github.com/koiosonline/lib.git
```

Change directory: 
```
cd `path to` koios/lib/tests
```
NPM: 
```
npm install
```

## Usage 
Run tests: 
```
npm test 
```

Jest continues to run in the terminal and will test again after each change. Enter `q` to quit the watch mode. Or check 'watch usage' for further actions. 

### Watch Usage
 * › Press f to run only failed tests.
 * › Press o to only run tests related to changed files.
 * › Press p to filter by a filename regex pattern.
 * › Press t to filter by a test name regex pattern.
 * › Press q to quit watch mode.
 * › Press Enter to trigger a test run.

## Workflow 
GitHub Actions are set to run the tests automatically after each push and/or pull request to the master branche. Actions will only run 
on the master branche. If the test fails, you will not be able to merge it. All tests should pass, before you can 
merge the code with the master branche.

## Write a test
All tests must be placed in the test directory. We keep and mimic the folder structure of the main project for readability. 

### Create a test file
Once you are in the correct directory, create a file with the same name and add '.test' just before the extension. 

Example: 
```
index.test.js 
```

### Create your first test 
1. Import the function you want to test (make sure the function is exported).
```
import { Your Function } from '../path';
```
2. Create the test by describing the function you are going to test: 

```
describe('Your Function', () => {

});
```

3. Write the test and what the output should be: 
```
describe('sum', () => {
    it('should return 3 if I add number 1 and 2 as parameters', () => {
        expect(sum(1, 2)).toBe(3);
    });
});
```

#### PLEASE MAKE SURE: 
- That you describe each test as specific as possible (this makes it easier to find a test when it fails).
- In the best case you'll write the test before the actual function, so you know exactly what the function should to and what the result has to be (not necessary).
- NEVER EVER change the test instead of the function (unless the function isn't correct). If you adapt the test to pass. Why do you test at all?
- Use the right Jest methods, see [this link](https://jestjs.io/docs/en/expect) for all available methods. 
* A little sidenote: if the expected result isn't a literal (ie string, number, boolean etc), then you need to use `toEqual()`, not `toBe()`.
- Start the test with 'it' and describe exactly what it should do ('it' is an alias of 'test' and the result is the same). 

#### Why `it` instead of `test`?

For readability! (And consistency).

If you use 'test':
```
describe('Your Function', () => {
  test('if it does this', () => {});
});
```
You'll receive the following error in your terminal: 
```
Your Function > if it does this 
```
If you use 'it': 
```
describe('yourModule', () => {
  it('should do this', () => {});
});
```
You'll receive the following error in your terminal:
```
Your Function > should do this 
```


## Sources
* https://jestjs.io/
* https://www.npmjs.com/package/jest
