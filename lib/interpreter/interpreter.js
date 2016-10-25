import { Func } from 'terms/function'

const MAX_REDUCTIONS = 10000;

export class Interpreter {

  /**
   * Reducing the leftmost redex first means that the normal form of a lambda expression is always found if it exists
   * according to the "Normalization Theorem".
   * 
   * This is different from a typical Lisp implementation where arguments are always evaluated first before the function itself is evaluated.
   */
  eval(term) {
    Func.resetRenamedVariableCount();
    const originalTermString = term.toString();
    let reductionCount = 0;
    let [redex, treeUpdateAfterReduction] = term.findLeftMostRedex((reduced) => term = reduced);

    while(redex && (reductionCount <= MAX_REDUCTIONS)) {
      treeUpdateAfterReduction(redex.reduce());
      reductionCount++;
      [redex, treeUpdateAfterReduction] = term.findLeftMostRedex((reduced) => term = reduced);
    }
    if (reductionCount > MAX_REDUCTIONS) {
      throw new Error(`Potential infinite loop detected while evaluating ${originalTermString}, aborting...`);
    }
    return term;
  }
}