import express from 'express';
import server from 'nodebootstrap-server';
import setup  from './appConfig.js';

server.setup(express(), setup);
