#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	usage
	  $ termodoro-front

	while running press:
		p - pause
		r - reset
		s - skip to next phase
		q - quit
`,
	{
		importMeta: import.meta,
		flags: {},
	},
);

render(<App />);
