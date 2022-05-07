import { RestApiService } from './service';
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { EventModel } from './model';

const colors: any | undefined = {
  green: {
    primary: '#00b300',
  },
  orange: {
    primary: '#ff3300',
  },
  blue: {
    primary: '#000099',
  },
};

@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      h3 {
        margin: 0 0 10px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 15px;
      }
    `,
  ],
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData!: {
    action: string;
    event: CalendarEvent | undefined;
  };
  priority!:[{
    id:number;
    value:string
  }]

  eventList: EventModel[] = [];
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  constructor(private modal: NgbModal, private service: RestApiService) {}

  ngOnInit() {
    this.priority!.push({
      id:1,
      value:"High"
    },
    {
      id:2,
      value:"Medium"
    },
    {
      id:3,
      value:"Low"
    })
    this.getEventsList();
  }
  getEventsList() {
    this.service.getEvent().subscribe((data) => {
      if (data) {
        this.eventList = data;
        this.eventList?.map((element) => {
          let obj: CalendarEvent = {
            start: element.StartDate,
            end: element.EndDate,
            title: element.Title,
            color: this.getColor(element.Priory),
            actions: this.actions,
            allDay: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: true,
            id: element.EventId,
          };
          this.events.push(obj);
        });
      }
    });
  }
  getColor(priority: number) {
    if (priority == 1) {
      return colors.green;
    } else if (priority == 2) {
      return colors.orange;
    } else {
      return colors.blue;
    }
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    let e = this.eventList.filter((x) => x.EventId === event.id)[0];
    e.StartDate = newStart;
    e.EndDate = newEnd;
    this.service.createEvent(e).subscribe((response) => {
      if (response) {
        this.getEventsList();
      }
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    let id = this.events.filter((event) => event !== eventToDelete)[0]?.id;
    this.service.deleteEvent(id).subscribe((response) => {
      if (response) {
        this.getEventsList();
      }
    });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
