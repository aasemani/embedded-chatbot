import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CcaisChatbotModule } from "@ccais/embedded-chatbot-angular";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CcaisChatbotModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
