import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type TransportType = 'flight' | 'train' | 'bus';
type SegmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'refunded';
type OrderStatus = 'active' | 'completed' | 'cancelled';

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Segment {
  id: string;
  type: TransportType;
  status: SegmentStatus;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  carrier: string;
  flightNumber: string;
  price: number;
  passengers: string[];
  services: Service[];
}

interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalPrice: number;
  segments: Segment[];
  passengers: Passenger[];
}

const mockOrder: Order = {
  id: 'ORD-2025-10-001',
  status: 'active',
  createdAt: '2025-10-01T10:30:00',
  totalPrice: 45800,
  passengers: [
    { id: 'p1', firstName: 'Иван', lastName: 'Петров', documentNumber: '4517 123456' },
    { id: 'p2', firstName: 'Мария', lastName: 'Петрова', documentNumber: '4518 654321' },
    { id: 'p3', firstName: 'Анна', lastName: 'Сидорова', documentNumber: '4519 789012' },
  ],
  segments: [
    {
      id: 's1',
      type: 'flight',
      status: 'confirmed',
      from: 'Москва (SVO)',
      to: 'Санкт-Петербург (LED)',
      departureDate: '2025-10-15',
      departureTime: '08:30',
      arrivalDate: '2025-10-15',
      arrivalTime: '10:00',
      carrier: 'Аэрофлот',
      flightNumber: 'SU 1234',
      price: 8500,
      passengers: ['p1', 'p2'],
      services: [
        { id: 'srv1', name: 'Багаж 23кг', price: 1500 },
        { id: 'srv2', name: 'Выбор места', price: 500 },
      ],
    },
    {
      id: 's2',
      type: 'train',
      status: 'confirmed',
      from: 'Санкт-Петербург',
      to: 'Москва',
      departureDate: '2025-10-20',
      departureTime: '18:00',
      arrivalDate: '2025-10-21',
      arrivalTime: '02:00',
      carrier: 'РЖД',
      flightNumber: '001А',
      price: 12000,
      passengers: ['p1', 'p2', 'p3'],
      services: [
        { id: 'srv3', name: 'Питание', price: 800 },
      ],
    },
    {
      id: 's3',
      type: 'bus',
      status: 'pending',
      from: 'Москва',
      to: 'Тула',
      departureDate: '2025-10-22',
      departureTime: '14:00',
      arrivalDate: '2025-10-22',
      arrivalTime: '17:30',
      carrier: 'Фликсбас',
      flightNumber: 'FB-405',
      price: 1200,
      passengers: ['p1'],
      services: [],
    },
  ],
};

const Index = () => {
  const [order] = useState<Order>(mockOrder);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'refund' | null>(null);

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case 'flight': return 'Plane';
      case 'train': return 'Train';
      case 'bus': return 'Bus';
    }
  };

  const getStatusColor = (status: SegmentStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: SegmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Подтверждён';
      case 'pending': return 'Ожидает';
      case 'cancelled': return 'Отменён';
      case 'refunded': return 'Возвращён';
    }
  };

  const handleAction = (segment: Segment, action: 'cancel' | 'refund') => {
    setSelectedSegment(segment);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    toast.success(
      actionType === 'cancel' 
        ? `Сегмент ${selectedSegment?.flightNumber} отменён` 
        : `Возврат по сегменту ${selectedSegment?.flightNumber} оформлен`
    );
    setDialogOpen(false);
  };

  const getPassengerName = (passengerId: string) => {
    const passenger = order.passengers.find(p => p.id === passengerId);
    return passenger ? `${passenger.firstName} ${passenger.lastName}` : '';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Заказ {order.id}</h1>
            <p className="text-muted-foreground mt-1">Создан {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <Badge className="h-8 px-4 bg-primary text-primary-foreground border-0">
            {order.status === 'active' ? 'Активный' : order.status === 'completed' ? 'Завершён' : 'Отменён'}
          </Badge>
        </div>

        <Card className="p-6 shadow-lg border-2 hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Общая стоимость</p>
              <p className="text-3xl font-bold text-foreground">{order.totalPrice.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Сегментов</p>
              <p className="text-3xl font-bold text-foreground">{order.segments.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Пассажиров</p>
              <p className="text-3xl font-bold text-foreground">{order.passengers.length}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid h-auto">
            <TabsTrigger value="segments" className="text-sm md:text-base">
              <Icon name="List" size={18} className="mr-2" />
              Сегменты
            </TabsTrigger>
            <TabsTrigger value="passengers" className="text-sm md:text-base">
              <Icon name="Users" size={18} className="mr-2" />
              Пассажиры
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm md:text-base">
              <Icon name="Clock" size={18} className="mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-4 mt-6">
            {order.segments.map((segment) => (
              <Card key={segment.id} className="overflow-hidden border-2 hover:shadow-lg transition-all hover-scale">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name={getTransportIcon(segment.type)} size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{segment.carrier}</h3>
                        <p className="text-muted-foreground">{segment.flightNumber}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(segment.status)} border`}>
                      {getStatusText(segment.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Icon name="MapPin" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{segment.from}</p>
                        <p className="text-sm text-muted-foreground">{segment.departureDate} в {segment.departureTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="MapPinCheckInside" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{segment.to}</p>
                        <p className="text-sm text-muted-foreground">{segment.arrivalDate} в {segment.arrivalTime}</p>
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="border-t pt-4">
                    <AccordionItem value="details" className="border-0">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        Детали сегмента
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <p className="text-sm font-semibold mb-2">Пассажиры ({segment.passengers.length})</p>
                            <div className="space-y-1">
                              {segment.passengers.map((passengerId) => (
                                <div key={passengerId} className="flex items-center gap-2 text-sm">
                                  <Icon name="User" size={16} className="text-muted-foreground" />
                                  <span>{getPassengerName(passengerId)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {segment.services.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Дополнительные услуги</p>
                              <div className="space-y-1">
                                {segment.services.map((service) => (
                                  <div key={service.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <Icon name="Package" size={16} className="text-muted-foreground" />
                                      {service.name}
                                    </span>
                                    <span className="font-semibold">{service.price} ₽</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Стоимость сегмента</span>
                            <span className="text-xl font-bold text-primary">{segment.price.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {segment.status === 'confirmed' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAction(segment, 'cancel')}
                        className="flex-1"
                      >
                        <Icon name="XCircle" size={16} className="mr-2" />
                        Отменить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAction(segment, 'refund')}
                        className="flex-1"
                      >
                        <Icon name="RefreshCcw" size={16} className="mr-2" />
                        Возврат
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="passengers" className="space-y-4 mt-6">
            {order.passengers.map((passenger) => {
              const passengerSegments = order.segments.filter(s => s.passengers.includes(passenger.id));
              return (
                <Card key={passenger.id} className="p-6 border-2 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={28} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{passenger.firstName} {passenger.lastName}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Документ: {passenger.documentNumber}</p>
                      
                      <div>
                        <p className="text-sm font-semibold mb-2">Участвует в сегментах ({passengerSegments.length})</p>
                        <div className="space-y-2">
                          {passengerSegments.map((segment) => (
                            <div key={segment.id} className="flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                              <Icon name={getTransportIcon(segment.type)} size={18} className="text-primary" />
                              <span className="font-medium">{segment.from} → {segment.to}</span>
                              <span className="text-muted-foreground">{segment.departureDate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6 border-2">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Заказ создан</p>
                    <p className="text-sm text-muted-foreground">01 октября 2025, 10:30</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Сегмент подтверждён</p>
                    <p className="text-sm text-muted-foreground">Авиаперелёт SU 1234 · 01 октября 2025, 10:35</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Сегмент подтверждён</p>
                    <p className="text-sm text-muted-foreground">Поезд 001А · 01 октября 2025, 10:40</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="CreditCard" size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Оплата получена</p>
                    <p className="text-sm text-muted-foreground">45 800 ₽ · 01 октября 2025, 10:45</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' ? 'Отмена сегмента' : 'Возврат билета'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' 
                ? 'Вы уверены, что хотите отменить этот сегмент? Действие нельзя отменить.'
                : 'Вы уверены, что хотите оформить возврат по этому сегменту?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSegment && (
            <div className="py-4 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Детали сегмента</p>
                <p className="text-sm">{selectedSegment.carrier} {selectedSegment.flightNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedSegment.from} → {selectedSegment.to}</p>
                <p className="text-sm text-muted-foreground">{selectedSegment.departureDate}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Стоимость</span>
                <span className="font-bold">{selectedSegment.price.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant={actionType === 'cancel' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              {actionType === 'cancel' ? 'Отменить сегмент' : 'Оформить возврат'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
