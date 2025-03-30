/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { createModule, gql } from 'graphql-modules';
import EventsObserver from '../../events/eventsObserver';
import { resolver } from '../../../domain/types';
import { LogTable } from '../../db/tables';
import Log from '../../repository/Log';

const logModule = createModule({
  id: 'log-module',
  dirname: __dirname,
  typeDefs: [
    gql`
      type Query {
        getLogs: [Log]
        getLog(id: String!): Log
      }
      type Mutation {
        createLog(log: LogInput): Log
        removeLog(id: String!): Boolean
        editLog(id: String! log: LogInput): Log
        closeLog(id: String!): Boolean
      }
        type Log {
            id: String
            text: String
            name: String
            password: String
            create_date: DateTime
            update_date: DateTime
            remove_date: DateTime
            is_closed: Boolean
            close_date: DateTime
        }
        input LogInput {
            name: String
        }
    `,
  ],
  resolvers: {
    Query: {
      getLogs: resolver<{}, LogTable[]>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'getLogs', data: args });
        return new Log(context).getAll();
      }),
      getLog: resolver<{ id: string }, LogTable>(
        async (parent, args, context) => {
          EventsObserver.listener({ type: 'getLog', data: args });
          return new Log(context, args.id).getData();
        },
      ),
    },
    Mutation: {
      createLog: resolver<{ log: Partial<LogTable> }, LogTable>(
        async (parent, args, context) => {
          EventsObserver.listener({ type: 'createLog', data: args });
          return new Log(context).create(args.log);
        },
      ),
      editLog: resolver<{ id: string, log: Partial<LogTable> }, LogTable>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'editLog', data: args });
        const log = new Log(context, args.id);
        await log.edit(args.log);
        return log.getData();
      }),
      removeLog: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'removeLog', data: args });
        const log = new Log(context, args.id);
        await log.delete();
        return true;
      }),
      closeLog: resolver<{ id: string }, boolean>(async (parent, args, context) => {
        EventsObserver.listener({ type: 'closeLog', data: args });
        return new Log(context, args.id).close();
      }),
    },
    Log: {
      text: resolver<LogTable, string>(async (parent, args, context) => {
        return new Log(context, parent.id).getText();
      }),
    },
  },
});

export default logModule;