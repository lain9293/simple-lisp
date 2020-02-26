const simpleLisp = {
  car(x) {
    return x[0][0] ? x[0][0] : [];
  },

  cdr(x) {
    return x[0].slice(1);
  },

  cons(x) {
    if (Array.isArray(x[0])) {
      return x.reduce((acc, val) => [...acc, ...val]);
    } else {
      let tail = x.slice(1)
      const newTail = tail.reduce((acc, val) => [...acc, ...val])
      newTail.unshift(x[0]);
      return newTail;
    }
  },

  cond(x) {
    let res = [];
    for (let i = 0; i < x.length; i++) {
      let temp = this.interpret(x[i][0]);
      if (temp.hasOwnProperty('value') ? temp.value : temp) {
        res = this.interpret(x[i][1]);
        break;
      }
    }
    return res;
  },

  print(x) {
    if (Array.isArray(x)) {
      return x[0];
    }
    return x;
  },

  //Math
  '+'(x) {
    return {
      type: 'number',
      value: x.reduce((acc, val) =>
        acc + this.interpret(val).value, 0),
    };
  },

  '-'(x) {
    if (x.length === 1) {
      return {
        type: 'number',
        value: -this.interpret(x[0]).value
      };
    }
    return {
      type: 'number',
      value: this.interpret(x[0]).value - this.interpret(x[1]).value
    };
  },

  '*'(x) {
    return {
      type: 'number',
      value: x.reduce((acc, val) =>
        acc * this.interpret(val).value, 1),
    };
  },

  '/'(x) {
    return {
      type: 'number',
      value: this.interpret(x[0]).value / this.interpret(x[1]).value
    };
  },

  '='(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value === this.interpret(x[1]).value
    };
  },

  '!='(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value !== this.interpret(x[1]).value
    };
  },

  '<'(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value < this.interpret(x[1]).value
    };
  },

  '>'(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value > this.interpret(x[1]).value
    };
  },

  '<='(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value <= this.interpret(x[1]).value
    };
  },

  '>='(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value >= this.interpret(x[1]).value
    };
  },

  'and'(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value && this.interpret(x[1]).value
    };
  },

  'or'(x) {
    return {
      type: 'boolean',
      value: this.interpret(x[0]).value || this.interpret(x[1]).value
    };
  },

  'not'(x) {
    return {
      type: 'boolean',
      value: !this.interpret(x[0]).value
    };
  },

  'nil'(x) {
    if (Array.isArray(x[0])) {
      return x[0].length <= 0;
    } else {
      return !x[0];
    }
  },

  replaceAll(func, params, inputs) {
    if (Array.isArray(func)) {
      return func.map(f => {
        if (Array.isArray(f)) {
          return this.replaceAll(f, params, inputs);
        } else {
          params.forEach((p, index) => {
            if (f.type === 'identifier' && f.value === p.value) {
              f = inputs[0][index];
            }
          })
          return f;
        }
      })
    } else {
      return func;
    }
  },

  addToLibrary(name, params, func) {
    return this[name.value] = (...inputs) => {
      let _func = func;
      _func = this.replaceAll(_func, params, inputs);
      return this.interpret(_func);
    }
  },

  resolve(inputs) {
    if (inputs.length > 0 && inputs[0].type === 'identifier') {
      const res = inputs.slice(1).map(t => {
        if (Array.isArray(t) && t.length > 0 && t[0].type === 'identifier') {
          return this.resolve(t)
        } else {
          return t;
        }
      })
      if (inputs.length > 0 && inputs[0].value in this) {
        return this[inputs[0].value](res);
      } else {
        return res;
      }
    } else {
      return inputs;
    }
  },

  interpretList(input) {
    if (input.length === 4 && input[0].value === 'defun') {
      this.addToLibrary(input[1], input[2], input[3]);
      return undefined;
    } else {
      return this.resolve(input);
    }
  },

  interpret(input) {
    if (input instanceof Array) {
      return this.interpretList(input);
    } else if (input.type === "identifier") {
      return this[input.value];
    } else if (input.type === "number" || input.type === "string" || input.type === "boolean") {
      return input;
    }
  },

  categorize(input) {
    if (input === "t" || input === "f") {
      return {
        type: 'boolean',
        value: (input == 't')
      };
    } else if (!isNaN(parseFloat(input))) {
      return {
        type: 'number',
        value: parseFloat(input)
      };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return {
        type: 'string',
        value: input.slice(1, -1)
      };
    } else {
      return {
        type: 'identifier',
        value: input
      };
    }
  },

  parenthesize(input, list) {
    if (list === undefined) {
      return this.parenthesize(input, []);
    } else {
      const token = input.shift();
      if (token === undefined) {
        return list.pop();
      } else if (token === "(") {
        list.push(this.parenthesize(input, []));
        return this.parenthesize(input, list);
      } else if (token === ")") {
        return list;
      } else {
        return this.parenthesize(input, list.concat(this.categorize(token)));
      }
    }
  },

  tokenize(input) {
    return input.split('"')
      .map((x, i) => {
        if (i % 2 === 0) {
          return x.replace(/\(/g, ' ( ')
            .replace(/\)/g, ' ) ');
        } else {
          return x.replace(/ /g, "!whitespace!");
        }
      })
      .join('"')
      .trim()
      .split(/\s+/)
      .map((x) => {
        return x.replace(/!whitespace!/g, " ");
      });
  },

  sentenceSplit(_input) {
    let input = _input.replace(/;.*\n/g, '')
    let count = 0;
    let flag = false;
    let res = [];
    let start = 0;
    for (let i = 0; i < input.length; i++) {
      if (!count && flag) {
        res.push(input.slice(start, i));
        start = i;
        flag = !flag;
      }
      if (input[i] === '(') count++;
      if (input[i] === ')') count--;
      if (!count) flag = !flag;
    }
    if (start < input.length) res.push(input.slice(start));
    return res;
  },

  parse(input) {
    return this.parenthesize(this.tokenize(input));
  },

  execute(input) {
    let res = [];
    if (input.match(/[^"]?\(.*\)[^"]/gm)) {
      this.sentenceSplit(input).forEach(sentence => {
        const temp = this.interpret(this.parse(sentence))
        if (temp !== undefined) {
          res.push(temp);
        }
      })
    } else {
      res = this.interpret(this.parse(input))
    }
    if (res.length === 1) {
      res = res[0];
    }
    if (res instanceof Array) {
      return res.map(x => x.value ? x.value : x);
    } else {
      return res.hasOwnProperty('value') ? res.value : res;
    }
  }
};

module.exports = {
  simpleLisp
};