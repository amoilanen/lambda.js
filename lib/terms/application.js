import { Term } from 'terms/term'
import { Func } from 'terms/function'
import { unique } from 'util/arrays'

//(λx.x)y
export class Application extends Term {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  reduce() {
    if (this.left instanceof Func) {
      return this.left.apply(this.right);
    } else {
      return this;
    }
  }

  getFreeVariables() {
    return unique(
      this.left.getFreeVariables()
        .concat(this.right.getFreeVariables())
    );
  }

  findLeftMostRedex(treeUpdateAfterReduction) {
    let redex;

    if (this.left instanceof Func) {
      [redex, treeUpdateAfterReduction] = [this, treeUpdateAfterReduction];
    } else {
      [redex, treeUpdateAfterReduction] =
        this.left.findLeftMostRedex((reduced) => this.left = reduced)
        || this.right.findLeftMostRedex((reduced) => this.right = reduced);
    }
    return [redex, treeUpdateAfterReduction];
  }

  substitute(variableName, term) {
    return new Application(
      this.left.substitute(variableName, term),
      this.right.substitute(variableName, term)
    );
  }

  toString() {
    return `(${this.left}${this.right})`;
  }
}