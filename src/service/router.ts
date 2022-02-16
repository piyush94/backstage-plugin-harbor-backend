/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler } from "@backstage/backend-common";
import { Config } from "@backstage/config";
import express from "express";
import Router from "express-promise-router";
import { Logger } from "winston";
import { getArtifacts } from "./artifact";
import { repoSearch } from "./search";

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions
): Promise<express.Router> {
  const { logger } = options;

  logger.info("Initializing harbor backend");
  const baseUrl = options.config.getString("harbor.baseUrl");
  const username = options.config.getString("harbor.username");
  const password = options.config.getString("harbor.password");

  const router = Router();
  router.use(express.json());

  router.get("/artifacts", async (request, response) => {
    const project: any = request.query.project;
    const repository: any = request.query.repository;

    const artifacts = await getArtifacts(
      baseUrl,
      username,
      password,
      project,
      decodeURIComponent(repository)
    );

    response.send(artifacts);
  });

  router.get("/search", async (request, response) => {
    const repository: any = request.query.repository;
    const search = await repoSearch(baseUrl, username, password, repository);

    response.send(search);
  });

  router.get("/health", (_, response) => {
    logger.info("PONG!");
    response.send({ status: "ok" });
  });
  router.use(errorHandler());
  return router;
}
