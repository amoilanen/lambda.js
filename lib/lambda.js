import { Parser } from 'parser/parser'
import { Interpreter } from 'interpreter/interpreter'

const parser = new Parser();
const interpreter = new Interpreter();

export const lambda = {
  eval: (expr) =>
    interpreter.eval(parser.parse(expr)).toString()
};

//TODO: Implement commands for the compiler and interpreter, REPL?