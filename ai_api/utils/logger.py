class Logger():
    log_path = None

    def log(self, message):
        if self.log_path is None: return 

        with open(self.log_path, "a") as log:
            log.write(f"{message}\n")

    def clear_log(self):
        if self.log_path is None: return 

        with open(self.log_path, "w") as log:
            log.write("")