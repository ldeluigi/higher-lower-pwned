import { HttpParams } from '@angular/common/http';

function addSingleParamsToHttp(params: HttpParams, paramName: string, param?: string): HttpParams {
  if (param !== undefined) {
    return params.set(paramName, param);
  }
  return params;
}

function addParamsToHttp(params: HttpParams, paramsList: {name: string, param?: string}[]): HttpParams {
  paramsList.forEach(element => {
    params = addSingleParamsToHttp(params, element.name, element.param);
  });
  return params;
}

export {
  addSingleParamsToHttp,
  addParamsToHttp
};
