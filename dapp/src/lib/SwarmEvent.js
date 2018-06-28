// @flow

export type SwarmEvent = {
  protocol: string,
  type: string,
  utc_timestamp: number,
  payload?: Object,
}

export const createEvent = (
  protocol: string,
  type: string,
  payload?: Object = {},
): SwarmEvent => ({
  protocol,
  type,
  payload,
  utc_timestamp: Date.now(),
})
