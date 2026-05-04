
# Reservar IP estático
gcloud compute addresses create ip-loadbalancer --region=europe-west1

# Ver IP reservado
gcloud compute addresses describe ip-loadbalancer --region=europe-west1

# Remover IP atual do lb1
gcloud compute instances delete-access-config lb1 --access-config-name="External NAT" --zone=europe-west1-b

# Associar IP estático ao lb1
gcloud compute instances add-access-config lb1 --access-config-name="External NAT" --address=34.62.101.141 --zone=europe-west1-b


-------------------------

Mongo db1

sudo systemctl status mongod
sudo systemctl start mongod
sudo systemctl restart mongod
sudo systemctl enable mongod

aceder ao mongoDb
mongosh
show dbs
use taxi_db
show collections
db.clientes.countDocuments()


mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "10.132.0.4:27017" },
    { _id: 1, host: "10.132.0.16:27017" },
    { _id: 2, host: "10.132.0.17:27017", arbiterOnly: true }
  ]
})
rs.status()
------------------------

criar vms/snapshots

# Imagem do backend (as1)
gcloud compute machine-images create imagem-backend --source-instance=as1 --source-instance-zone=europe-west1-b

# Imagem da base de dados (db1)
gcloud compute machine-images create imagem-db --source-instance=db1 --source-instance-zone=europe-west1-b

# VM de backend
gcloud compute instances create as3 --source-machine-image=imagem-backend --zone=europe-west1-b

# VM de base de dados
gcloud compute instances create db2 --source-machine-image=imagem-db --zone=europe-west1-b

# VM leve para arbiter
gcloud compute instances create db-arbiter --machine-type=e2-micro --zone=europe-west1-b --image-family=debian-12 --image-project=debian-cloud