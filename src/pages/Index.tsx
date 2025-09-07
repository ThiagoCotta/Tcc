import PCConfigForm from "@/components/PCConfigForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            PC Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monte a configuração perfeita para o seu setup. Configure cada componente e encontre as melhores opções do mercado.
          </p>
        </div>
        
        <PCConfigForm />
      </div>
    </div>
  );
};

export default Index;
