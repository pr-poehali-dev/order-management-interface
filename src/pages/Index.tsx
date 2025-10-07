import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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

interface PassengerService {
  passengerId: string;
  serviceId: string;
  serviceName: string;
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
  basePrice: number;
  passengerServices: PassengerService[];
}

interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  segments: Segment[];
  passengers: Passenger[];
}

const mockOrder: Order = {
  id: 'ORD-2025-10-001',
  status: 'active',
  createdAt: '2025-10-01T10:30:00',
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
      basePrice: 5000,
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv1', serviceName: 'Билет', price: 5000 },
        { passengerId: 'p1', serviceId: 'srv2', serviceName: 'Багаж 23кг', price: 1500 },
        { passengerId: 'p1', serviceId: 'srv3', serviceName: 'Выбор места 12A', price: 500 },
        { passengerId: 'p2', serviceId: 'srv4', serviceName: 'Билет', price: 5000 },
        { passengerId: 'p2', serviceId: 'srv5', serviceName: 'Багаж 23кг', price: 1500 },
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
      basePrice: 3500,
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv6', serviceName: 'Билет (купе)', price: 3500 },
        { passengerId: 'p1', serviceId: 'srv7', serviceName: 'Питание', price: 800 },
        { passengerId: 'p2', serviceId: 'srv8', serviceName: 'Билет (купе)', price: 3500 },
        { passengerId: 'p2', serviceId: 'srv9', serviceName: 'Питание', price: 800 },
        { passengerId: 'p3', serviceId: 'srv10', serviceName: 'Билет (плацкарт)', price: 2200 },
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
      basePrice: 1200,
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv11', serviceName: 'Билет', price: 1200 },
      ],
    },
  ],
};

const Index = () => {
  const [order] = useState<Order>(mockOrder);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'refund' | 'cancelOrder' | 'refundOrder' | null>(null);
  const [expandedSegments, setExpandedSegments] = useState<string[]>([]);

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

  const handleAction = (segment: Segment | null, action: 'cancel' | 'refund' | 'cancelOrder' | 'refundOrder') => {
    setSelectedSegment(segment);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (actionType === 'cancelOrder') {
      toast.success('Весь заказ отменён');
    } else if (actionType === 'refundOrder') {
      toast.success('Возврат по всему заказу оформлен');
    } else {
      toast.success(
        actionType === 'cancel' 
          ? `Сегмент ${selectedSegment?.flightNumber} отменён` 
          : `Возврат по сегменту ${selectedSegment?.flightNumber} оформлен`
      );
    }
    setDialogOpen(false);
  };

  const getPassengerName = (passengerId: string) => {
    const passenger = order.passengers.find(p => p.id === passengerId);
    return passenger ? `${passenger.firstName} ${passenger.lastName}` : '';
  };

  const getPassengerById = (passengerId: string) => {
    return order.passengers.find(p => p.id === passengerId);
  };

  const getSegmentPassengers = (segment: Segment) => {
    const passengerIds = [...new Set(segment.passengerServices.map(ps => ps.passengerId))];
    return passengerIds.map(id => order.passengers.find(p => p.id === id)!).filter(Boolean);
  };

  const getPassengerServicesInSegment = (segment: Segment, passengerId: string) => {
    return segment.passengerServices.filter(ps => ps.passengerId === passengerId);
  };

  const getSegmentTotalPrice = (segment: Segment) => {
    return segment.passengerServices.reduce((sum, ps) => sum + ps.price, 0);
  };

  const getOrderTotalPrice = () => {
    return order.segments.reduce((sum, seg) => sum + getSegmentTotalPrice(seg), 0);
  };

  const getPassengerSegments = (passengerId: string) => {
    return order.segments.filter(seg => 
      seg.passengerServices.some(ps => ps.passengerId === passengerId)
    );
  };

  const getPassengerTotalSpent = (passengerId: string) => {
    return order.segments.reduce((sum, seg) => {
      const passengerServices = seg.passengerServices.filter(ps => ps.passengerId === passengerId);
      return sum + passengerServices.reduce((s, ps) => s + ps.price, 0);
    }, 0);
  };

  const toggleSegment = (segmentId: string) => {
    setExpandedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Заказ {order.id}</h1>
            <p className="text-muted-foreground mt-1">
              Создан {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="h-8 px-4 bg-primary text-primary-foreground border-0">
              {order.status === 'active' ? 'Активный' : order.status === 'completed' ? 'Завершён' : 'Отменён'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Icon name="MoreVertical" size={18} className="mr-2" />
                  Действия с заказом
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleAction(null, 'cancelOrder')}>
                  <Icon name="XCircle" size={16} className="mr-2" />
                  Отменить весь заказ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(null, 'refundOrder')}>
                  <Icon name="RefreshCcw" size={16} className="mr-2" />
                  Вернуть весь заказ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="Mail" size={16} className="mr-2" />
                  Отправить на почту
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="p-6 shadow-lg border-2 hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Общая стоимость</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{getOrderTotalPrice().toLocaleString('ru-RU')} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Сегментов</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{order.segments.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Пассажиров</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{order.passengers.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Статус</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold">Все подтверждены</span>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid h-auto">
            <TabsTrigger value="segments" className="text-sm md:text-base">
              <Icon name="Route" size={18} className="mr-2" />
              Сегменты ({order.segments.length})
            </TabsTrigger>
            <TabsTrigger value="passengers" className="text-sm md:text-base">
              <Icon name="Users" size={18} className="mr-2" />
              Пассажиры ({order.passengers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Показаны все сегменты путешествия. Каждый можно отменить или вернуть отдельно.
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setExpandedSegments(expandedSegments.length === order.segments.length ? [] : order.segments.map(s => s.id))}
              >
                {expandedSegments.length === order.segments.length ? 'Свернуть все' : 'Развернуть все'}
              </Button>
            </div>

            {order.segments.map((segment, index) => {
              const passengers = getSegmentPassengers(segment);
              const totalPrice = getSegmentTotalPrice(segment);
              const isExpanded = expandedSegments.includes(segment.id);

              return (
                <Card key={segment.id} className="overflow-hidden border-2 hover:shadow-lg transition-all">
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={getTransportIcon(segment.type)} size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs md:text-sm font-semibold text-muted-foreground">Сегмент {index + 1}</span>
                            <Badge className={`${getStatusColor(segment.status)} border text-xs`}>
                              {getStatusText(segment.status)}
                            </Badge>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold truncate">{segment.carrier}</h3>
                          <p className="text-sm text-muted-foreground">{segment.flightNumber}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-muted-foreground">Стоимость</p>
                        <p className="text-lg md:text-xl font-bold text-primary">{totalPrice.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Icon name="MapPin" size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm md:text-base truncate">{segment.from}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {new Date(segment.departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {segment.departureTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="MapPinCheckInside" size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm md:text-base truncate">{segment.to}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {new Date(segment.arrivalDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в {segment.arrivalTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold">Пассажиры в сегменте ({passengers.length})</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleSegment(segment.id)}
                          className="h-8"
                        >
                          {isExpanded ? (
                            <>
                              <Icon name="ChevronUp" size={16} className="mr-1" />
                              Свернуть
                            </>
                          ) : (
                            <>
                              <Icon name="ChevronDown" size={16} className="mr-1" />
                              Детали
                            </>
                          )}
                        </Button>
                      </div>

                      {!isExpanded && (
                        <div className="flex flex-wrap gap-2">
                          {passengers.map((passenger) => {
                            const services = getPassengerServicesInSegment(segment, passenger.id);
                            const passengerTotal = services.reduce((sum, s) => sum + s.price, 0);
                            return (
                              <div key={passenger.id} className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                                <Icon name="User" size={14} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{passenger.firstName} {passenger.lastName}</span>
                                <span className="text-xs text-muted-foreground">({passengerTotal.toLocaleString('ru-RU')} ₽)</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-3">
                          {passengers.map((passenger) => {
                            const services = getPassengerServicesInSegment(segment, passenger.id);
                            const passengerTotal = services.reduce((sum, s) => sum + s.price, 0);

                            return (
                              <Card key={passenger.id} className="p-4 bg-background/50">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                      <Icon name="User" size={18} className="text-secondary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">{passenger.firstName} {passenger.lastName}</p>
                                      <p className="text-xs text-muted-foreground">{passenger.documentNumber}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold">{passengerTotal.toLocaleString('ru-RU')} ₽</p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Услуги</p>
                                  {services.map((service) => (
                                    <div key={service.serviceId} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Icon name="Check" size={14} className="text-green-600" />
                                        <span>{service.serviceName}</span>
                                      </div>
                                      <span className="font-medium">{service.price.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {segment.status === 'confirmed' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(segment, 'cancel')}
                          className="flex-1"
                        >
                          <Icon name="XCircle" size={16} className="mr-2" />
                          Отменить сегмент
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(segment, 'refund')}
                          className="flex-1"
                        >
                          <Icon name="RefreshCcw" size={16} className="mr-2" />
                          Возврат сегмента
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="passengers" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Детальная информация по каждому пассажиру: участие в сегментах и оформленные услуги.
            </p>

            {order.passengers.map((passenger) => {
              const segments = getPassengerSegments(passenger.id);
              const totalSpent = getPassengerTotalSpent(passenger.id);

              return (
                <Card key={passenger.id} className="p-4 md:p-6 border-2 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={28} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{passenger.firstName} {passenger.lastName}</h3>
                          <p className="text-sm text-muted-foreground">Документ: {passenger.documentNumber}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs text-muted-foreground">Общая стоимость</p>
                          <p className="text-2xl font-bold text-primary">{totalSpent.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      </div>
                      
                      <Separator className="mb-4" />

                      <div>
                        <p className="text-sm font-semibold mb-3">Участие в сегментах ({segments.length})</p>
                        <div className="space-y-3">
                          {segments.map((segment) => {
                            const services = getPassengerServicesInSegment(segment, passenger.id);
                            const segmentTotal = services.reduce((sum, s) => sum + s.price, 0);

                            return (
                              <div key={segment.id} className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Icon name={getTransportIcon(segment.type)} size={20} className="text-primary flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm truncate">{segment.from} → {segment.to}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {segment.carrier} {segment.flightNumber} · {new Date(segment.departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={`${getStatusColor(segment.status)} border text-xs flex-shrink-0 ml-2`}>
                                    {getStatusText(segment.status)}
                                  </Badge>
                                </div>

                                <div className="space-y-1 mb-2">
                                  {services.map((service) => (
                                    <div key={service.serviceId} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">{service.serviceName}</span>
                                      <span className="font-medium">{service.price.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                  ))}
                                </div>

                                <Separator className="my-2" />

                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold">Итого по сегменту</span>
                                  <span className="font-bold text-primary">{segmentTotal.toLocaleString('ru-RU')} ₽</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' && 'Отмена сегмента'}
              {actionType === 'refund' && 'Возврат билета'}
              {actionType === 'cancelOrder' && 'Отмена всего заказа'}
              {actionType === 'refundOrder' && 'Возврат всего заказа'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' && 'Вы уверены, что хотите отменить этот сегмент? Действие нельзя отменить.'}
              {actionType === 'refund' && 'Вы уверены, что хотите оформить возврат по этому сегменту?'}
              {actionType === 'cancelOrder' && 'Вы уверены, что хотите отменить весь заказ? Все сегменты будут отменены.'}
              {actionType === 'refundOrder' && 'Вы уверены, что хотите оформить возврат по всему заказу?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSegment ? (
            <div className="py-4 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Детали сегмента</p>
                <p className="text-sm">{selectedSegment.carrier} {selectedSegment.flightNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedSegment.from} → {selectedSegment.to}</p>
                <p className="text-sm text-muted-foreground">{selectedSegment.departureDate}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Стоимость</span>
                <span className="font-bold">{getSegmentTotalPrice(selectedSegment).toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Детали заказа</p>
                <p className="text-sm">Заказ {order.id}</p>
                <p className="text-sm text-muted-foreground">Сегментов: {order.segments.length}</p>
                <p className="text-sm text-muted-foreground">Пассажиров: {order.passengers.length}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Общая стоимость</span>
                <span className="font-bold">{getOrderTotalPrice().toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant={(actionType === 'cancel' || actionType === 'cancelOrder') ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              {actionType === 'cancel' && 'Отменить сегмент'}
              {actionType === 'refund' && 'Оформить возврат'}
              {actionType === 'cancelOrder' && 'Отменить заказ'}
              {actionType === 'refundOrder' && 'Вернуть заказ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
