import * as time from './time'
import datetime from './datetime'
import calendar from './calendar'
import json from './json'
import * as random from './random'
import * as math from './math'
import { KV } from '../../common/typescript'

const libModules: KV<any> = {
    time,
    datetime,
    calendar,
    random,
    math,
    json,
}

export default libModules