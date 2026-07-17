-- Allow authenticated admin users to delete cars.

create policy "cars_delete_authenticated"
  on public.cars
  for delete
  to authenticated
  using (true);
