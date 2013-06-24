N3parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "triple": parse_triple,
        "subject": parse_subject,
        "predicate": parse_predicate,
        "object": parse_object,
        "rdf": parse_rdf,
        "rdfs": parse_rdfs,
        "resource": parse_resource,
        "literal": parse_literal,
        "blank": parse_blank,
        "string": parse_string,
        "rdfURI": parse_rdfURI,
        "rdfsURI": parse_rdfsURI,
        "URI": parse_URI,
        "_": parse__
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var cacheKey = "start@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        
        result1 = parse_triple();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_triple();
          }
        } else {
          result0 = null;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_triple() {
        var cacheKey = "triple@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_subject();
        if (result0 !== null) {
          result1 = parse_predicate();
          if (result1 !== null) {
            result2 = parse_object();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 46) {
                result3 = ".";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\".\"");
                }
              }
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, subject, predicate, object) { return { 's': subject, 'p': predicate , 'o': object }; })(pos0, result0[0], result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_subject() {
        var cacheKey = "subject@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = pos;
        result0 = parse_resource();
        if (result0 !== null) {
          result0 = (function(offset, subject) { return { 'type': 'uri', 'value': subject } })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_blank();
          if (result0 !== null) {
            result0 = (function(offset, subject) { return { 'type': 'blank', 'value': subject } })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("subject");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_predicate() {
        var cacheKey = "predicate@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = pos;
        result0 = parse_rdf();
        if (result0 !== null) {
          result0 = (function(offset, predicate) { return { 'type': 'rdf', 'value': predicate } })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_rdfs();
          if (result0 !== null) {
            result0 = (function(offset, predicate) { return { 'type': 'rdfs', 'value': predicate } })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            result0 = parse_resource();
            if (result0 !== null) {
              result0 = (function(offset, predicate) { return { 'type': 'uri', 'value': predicate } })(pos0, result0);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("predicate");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_object() {
        var cacheKey = "object@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = pos;
        result0 = parse_rdf();
        if (result0 !== null) {
          result0 = (function(offset, object) { return { 'type': 'rdf', 'value': object } })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_rdfs();
          if (result0 !== null) {
            result0 = (function(offset, object) { return { 'type': 'rdfs', 'value': object } })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            result0 = parse_resource();
            if (result0 !== null) {
              result0 = (function(offset, object) { return { 'type': 'uri', 'value': object } })(pos0, result0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              result0 = parse_literal();
              if (result0 !== null) {
                result0 = (function(offset, object) { return { 'type': 'literal', 'value': object } })(pos0, result0);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                result0 = parse_blank();
                if (result0 !== null) {
                  result0 = (function(offset, object) { return { 'type': 'blank', 'value': object } })(pos0, result0);
                }
                if (result0 === null) {
                  pos = pos0;
                }
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("object");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rdf() {
        var cacheKey = "rdf@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 60) {
          result0 = "<";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"<\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_rdfURI();
          if (result1 !== null) {
            result2 = parse_URI();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 62) {
                result3 = ">";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\">\"");
                }
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 32) {
                  result4 = " ";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\" \"");
                  }
                }
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, start, rest) { return start + rest; })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("rdf resource");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rdfs() {
        var cacheKey = "rdfs@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 60) {
          result0 = "<";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"<\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_rdfsURI();
          if (result1 !== null) {
            result2 = parse_URI();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 62) {
                result3 = ">";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\">\"");
                }
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 32) {
                  result4 = " ";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\" \"");
                  }
                }
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, start, rest) { return start + rest; })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("rdf schema resource");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_resource() {
        var cacheKey = "resource@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 60) {
          result0 = "<";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"<\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_URI();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 62) {
              result2 = ">";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\">\"");
              }
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 32) {
                result3 = " ";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\" \"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, uri) { return uri; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("resource");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_literal() {
        var cacheKey = "literal@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_string();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 32) {
            result1 = " ";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\" \"");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, string) { return string; })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("literal");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_blank() {
        var cacheKey = "blank@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0;
        
        reportFailures++;
        pos0 = pos;
        result0 = [];
        if (/^[^<.]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[^<.]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[^<.]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[^<.]");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join("").trim(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("blank node");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_string() {
        var cacheKey = "string@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^"]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\"]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^"]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\"]");
              }
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result2 = "\"";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 39) {
            result0 = "'";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"'\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            if (/^[^']/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^']");
              }
            }
            while (result2 !== null) {
              result1.push(result2);
              if (/^[^']/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[^']");
                }
              }
            }
            if (result1 !== null) {
              if (input.charCodeAt(pos) === 39) {
                result2 = "'";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"'\"");
                }
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rdfURI() {
        var cacheKey = "rdfURI@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (input.substr(pos, 42) === "http://www.w3.org/1999/02/22-rdf-syntax-ns") {
          result0 = "http://www.w3.org/1999/02/22-rdf-syntax-ns";
          pos += 42;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"http://www.w3.org/1999/02/22-rdf-syntax-ns\"");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rdfsURI() {
        var cacheKey = "rdfsURI@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (input.substr(pos, 36) === "http://www.w3.org/2000/01/rdf-schema") {
          result0 = "http://www.w3.org/2000/01/rdf-schema";
          pos += 36;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"http://www.w3.org/2000/01/rdf-schema\"");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_URI() {
        var cacheKey = "URI@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result0 = [];
        if (/^[^>]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[^>]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[^>]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[^>]");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse__() {
        var cacheKey = "_@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        
        reportFailures++;
        result0 = [];
        if (/^[ \t\n\r(\r\n)\f]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\n\\r(\\r\\n)\\f]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[ \t\n\r(\r\n)\f]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[ \\t\\n\\r(\\r\\n)\\f]");
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();