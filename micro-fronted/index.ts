/*
 * @Date: 2025-04-13 14:20:49
 * @Description:
 */

import handleRouter from './handleRoute'
let _app = [];

export const getApps = () => _app;
export const registerMicroApps = (app) => (_app = app);
export const start = () => {
  //初始执行匹配
  handleRouter();
};
