import { Mutation, Resolver, Arg, ObjectType, Field } from 'type-graphql';
import EventsObserver from '../../../features/events/eventsObserver';
import { JSONResolver } from 'graphql-scalars';

@ObjectType()
export class Event {
  @Field()
  type: string;

  @Field(() => JSONResolver)
  data: any;
}

@Resolver()
export class EventResolver {
  @Mutation(() => Boolean)
  async eventBuildEnded(
    @Arg('containerId') containerId: string
  ): Promise<boolean> {
    EventsObserver.listener({
      type: 'buildEnded',
      data: {
        containerId,
      },
    });
    return true;
  }

  // @Subscription(() => Event)
  // async event() {
  //   return EventsObserver.getIterator();
  // }
}
