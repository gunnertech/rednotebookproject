export class Settings {
  // TODO: This is horrible - but works until we get a build system
  public static get ENV(): string { return window.location.hostname == 'localhost' || window.location.hostname.match(/0/) ? 'development' : 'production' }
  public static get API_ENDPOINT(): string { return window.location.hostname == 'localhost' || window.location.hostname.match(/0/) ? 'http://0.0.0.0:8080/api' : 'https://api.rednotebookproject.com/api' }
  public static get VALID_ACCOUNT_STATUSES(): string[] { return ['active','live']; }
   // public static get VALID_ACCOUNT_STATUSES(): string[] { return ['active','in_trial','live']; }
}
