import { Term } from 'terms/term'

export class Variable extends Term {
  constructor(name) {
    super();
    this.name = name;
  }

  substitute(variableName, term) {
    if (variableName === this.name) {
      return term;
    } else {
      return this;
    }
  }

  getFreeVariables() {
    return [this.name];
  }

  findLeftMostRedex(treeUpdateAfterReduction) {
    return [null, null];
  }

  toString() {
    return this.name;
  }
}