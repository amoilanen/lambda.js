import { Term } from 'terms/term'
import { Variable } from 'terms/variable'
import { without, contains } from 'util/arrays'

let renamedVariableCount = 0;

const generateVariableName = () =>
  't_' + (renamedVariableCount++)

//λx.x
export class Func extends Term {
  constructor(argument, body) {
    super();
    this.argument = argument;
    this.body = body;
  }

  apply(term) {
    return this.body.substitute(this.argument, term);
  }

  substitute(variableName, term) {
    const variableNameIsArgument = variableName === this.argument;
    const argumentIsFreeInTerm = contains(term.getFreeVariables(), this.argument);

    if (variableNameIsArgument || argumentIsFreeInTerm) {
      return this.alphaReduce().substitute(variableName, term);
    } else {
      return new Func(
        this.argument,
        this.body.substitute(variableName, term)
      );
    }
  }

  alphaReduce() {
    const oldArgument = this.argument;
    const renamedArgument = generateVariableName();

    return new Func(
      renamedArgument,
      this.body.substitute(this.argument, new Variable(renamedArgument))
    );
  }

  getFreeVariables() {
    return without(
      this.body.getFreeVariables(),
      this.argument
    );
  }

  findLeftMostRedex(treeUpdateAfterReduction) {
    return this.body.findLeftMostRedex((reduced) => this.body = reduced);
  }

  toString() {
    return `(λ${this.argument}.${this.body})`;
  }

  static resetRenamedVariableCount() {
    renamedVariableCount = 0;
  }
}