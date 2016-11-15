#!/usr/bin/env node

var lambda = require('../dist/lambda').lambda;
var commander = require("commander");

commander = commander
  .option("-e, --expr [value]", "evaluate following lambda expression")
  .option("-f, --file [value]", "evaluate lambda expression from following file")
  .option("-v, --version", "print version")
  .usage("[options] <expression|file>")
  .parse(process.argv);

if (commander.expr) {
  console.log(lambda.eval(commander.expr))
}

//TODO: Option to load an expression from file
//TODO: REPL-style evaluation