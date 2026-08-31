// Prism core + the languages the Next.js lessons use (tsx/ts, js, bash, json,
// css), plus a dark code theme. Import order matters: a language must load after
// the languages it extends (tsx depends on jsx + typescript; jsx depends on
// markup + javascript, both bundled in core).
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default Prism;
