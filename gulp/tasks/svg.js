import gulp from 'gulp';

import { plugins } from '../config/plugins.js';
import { filePaths } from '../config/paths.js';
import { logger } from "../config/logger.js";

const svg = (isBuild, serverInstance) => {
  return gulp.src(filePaths.src.svg)
    .pipe(logger.handleError('SVG'))
    .pipe(plugins.newer(filePaths.build.svg))   
    .pipe(plugins.if(isBuild, gulp.dest(filePaths.build.svg)))  
   
    .pipe(gulp.dest(filePaths.build.svg))
    .pipe(serverInstance.stream());
};

export { svg };