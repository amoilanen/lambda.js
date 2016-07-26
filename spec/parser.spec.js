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

  it('should parse empty expression', () => {
    expect(parser.parse('')).toEqual(null);
  });

  //TODO: 'λ', 'λx', 'λx.' is an invalid expression
  //TODO: '1' is and invalid expression
  //TODO: '[x]' is an invalid expression, unknown symbol

  //(λx.(λy.(λz.zyx)))
  xit('should parse nested functions 1', () => {
    
  });

  //(λx.x(λy.yxz))
  xit('should parse nested expression 2', () => {
    
  });

  //λf.(λx.f(xx))(λx.f(xx))
  xit('should parse Y combinator', () => {
    
  });

  //TODO: Several letter variables like abc?
  //TODO: Do not require parenthesis, set them up automatically
});