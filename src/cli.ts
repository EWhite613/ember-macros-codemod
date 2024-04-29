#!/usr/bin/env node

import path from 'path'
import {run} from 'jscodeshift/src/Runner'

const transformerPath = path.resolve(__dirname, process.argv[2])
const filePaths = process.argv.slice(3)

run(transformerPath, filePaths)
