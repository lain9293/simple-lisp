const simpleLisp = {
  library: {
    car: (x) => {
      return x[0][0] ? x[0][0] : [];
    },

    cdr: (x) => {
      return x[0].slice(1);
    },

    cons: (x) => {
      if (Array.isArray(x[0])) {
        return x.reduce((acc, val) => [...acc, ...val]);
      } else {
        let tail = x.slice(1)
        const newTail = tail.reduce((acc, val) => [...acc, ...val])
        newTail.unshift(x[0]);
        return newTail;
      }
    },

    print: (x) => {
      // console.log(x);
      return x[0];
    },

  },

  interpretList(input, context) {
    if (input.length > 0 && input[0].value in context) {
      return context[input[0].value](input.slice(1), context);
    } else {
      let list = input.map((x) => {
        return this.interpret(x, context);
      });
      if (list[0] instanceof Function) {
        return list[0].apply(undefined, list.slice(1));
      } else {
        return list;
      }
    }
  },

  interpret(input, context) {
    context = context || {
      ...this.library
    };
    if (input instanceof Array) {
      return this.interpretList(input, context);
    } else if (input.type === "identifier") {
      return context[input.value];
    } else if (input.type === "number" || input.type === "string") {
      return input.value;
    }
  },

  categorize(input) {
    if (!isNaN(parseFloat(input))) {
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

  parse(input) {
    return this.parenthesize(this.tokenize(input));
  },

  execute(input) {
    const res = this.interpret(this.parse(input));
    if (res instanceof Array) {
      return res.map(x => x.value ? x.value : x);
    } else
      return res.value ? res.value : res;
  }
};

module.exports = {
  simpleLisp
};