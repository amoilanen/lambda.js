import { Parser, Variable, Func, Application } from './lib/lambda'

describe('parser', () => {

  let parser;

  beforeEach(() => {
    parser = new Parser();
  });

  it('should parse variable', () => {
    expect(parser.parse('x')).toEqual(new Variable('x'));
  });

  it('should parse function', () => {
    expect(parser.parse('λx.x')).toEqual(new Func('x', new Variable('x')));
  });

  it('should parse application', () => {
    expect(parser.parse('xy')).toEqual(new Application(new Variable('x'), new Variable('y')));
  });

  describe('parentheses', () => {

    [
      ['(x)', new Variable('x')],
      ['(λx.x)', new Func('x', new Variable('x'))],
      ['(xy)', new Application(new Variable('x'), new Variable('y'))],
      ['(((x((y)))))', new Application(new Variable('x'), new Variable('y'))]
    ].forEach(([expr, result]) => {
      it(`should parse ${expr}`, () => {
        expect(parser.parse(expr)).toEqual(result);
      });
    });

    it('should throw an error if unmatched closing parentheses', () => {
      try {
        parser.parse('x)');
        throw 'Ignored unmatched closing parenthesis';
      } catch (e) {
        expect(e).toEqual('Unmatched closing parenthesis in \'x)\' at position 2');
      }
    });

    it('should throw an error if unmatched opening parentheses', () => {
      try {
        parser.parse('(x');
        throw 'Ignored missing closing parenthesis';
      } catch (e) {
        expect(e).toEqual('Missing closing parenthesis in \'(x\' at position 2');
      }
    });
  });

  describe('invalid expressions', () => {
    [
      ['', 'Empty expression is not expected at position 0'],
      ['λ', 'Incomplete function definition at position 1'],
      ['λx', 'Incomplete function definition at position 2'],
      ['λx.', 'Empty expression is not expected at position 3'],
      ['(λx.)z', 'Empty expression is not expected at position 4'],
      /*['1', 'Unknown symbol \'1\' at position 0'],
      ['[x]', 'Unknown symbol \'[\' at position 0'],
      ['xy?', 'Unknown symbol \'?\' at position 2']*/
    ].forEach(([expr, errorMessage]) => {
      it(`should throw error when parsing ${expr}`, () => {
        try {
          parser.parse(expr);
          throw `Should have reported ${errorMessage}`;
        } catch (e) {
          expect(e).toEqual(errorMessage);
        }
      });
    });
  });

  //(λx.x)z
  //(λx.(λy.(λz.zyx)))
  //(λx.x(λy.yxz))
  //(λf.(λx.f(xx))(λx.f(xx)))
  xit('should parse nested functions 1', () => {
    
  });

  //TODO: Do not require parenthesis, set them up automatically
});