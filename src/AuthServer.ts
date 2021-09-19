import express from 'express'
import { spotifyApi, stopWebServer } from './Bot'
import url from 'url'
const config = require("../config.json")

export const web = express()

web.get("/", (req, res) => {
    spotifyApi.authorizationCodeGrant((req.query.code as string)).then((data) => {
        spotifyApi.setAccessToken(data.body['access_token'])
        spotifyApi.setRefreshToken(data.body['refresh_token'])
        spotifyApi.setClientId(config.spotify.clientId)
        spotifyApi.setClientSecret(config.spotify.clientSecret)
        res.send("<p>200 ok</p")
        setTimeout(() => {
            stopWebServer()
        }, 2000)
    }).catch((err) => {
        console.error(err)
        res.writeHead(500)
    })
})